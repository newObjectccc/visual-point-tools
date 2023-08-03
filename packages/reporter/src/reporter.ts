import { uploadByFetch, fetcherFactory } from "packages/tools/src"

type UploadCallback = <T extends Object>(data: T) => boolean | Promise<boolean>

const urlRegExp = /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/

interface Reporter {
  reportIdle: (...args: any[]) => void
}

export interface WebReporterOptions {
  fetcher?: UploadCallback
  concurrent?: number
  finalTime?: number
  afterFetcher?: UploadCallback
  reportUrl?: string
  customOptionFetcher?: RequestInit
  retryTimesLimit?: number
}
export default class WebReporter implements Reporter {
  private static instance: WebReporter
  private concurrentRequests: number
  private reportQueue: unknown[]
  private finalTime: number
  private fetcher: UploadCallback
  private afterFetcher: UploadCallback | ((res: unknown) => boolean)
  private url?: string
  private retryTimesLimit: number
  private retryTimes: number
  constructor(options: WebReporterOptions) {
    if (!WebReporter.instance) {
      WebReporter.instance = this
    }
    const {afterFetcher, fetcher, concurrent, finalTime, reportUrl, customOptionFetcher, retryTimesLimit} = options
    if (reportUrl && !urlRegExp.test(reportUrl)) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('WebReporter: field reportUrlis invalid, it should be a http/https/ftp uri')
      }
    }
    if (!reportUrl && !fetcher) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('WebReporter: fields reportUrl & fetch should be set one at least')
      }
    }
    this.concurrentRequests = concurrent ?? 1
    this.reportQueue = []
    this.finalTime = finalTime ?? 0
    if (customOptionFetcher) {
      this.fetcher = fetcherFactory(customOptionFetcher)
    } else {
      this.fetcher = fetcher || uploadByFetch
    }
    this.afterFetcher = afterFetcher || ((res: any) => res)
    this.url = reportUrl
    this.retryTimes = 0
    this.retryTimesLimit = retryTimesLimit ?? 3
    return WebReporter.instance
  }

  changeReportUrl(reportUrl: string) {
    if (!urlRegExp.test(reportUrl)) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('WebReporter: field reportUrlis invalid, it should be a http/https/ftp uri')
      }
    }
    this.url = reportUrl
  }

  private pushReportQueue<T>(...dataList: T[]) {
    for (let i = 0; i < dataList.length; i++) {
      this.reportQueue.push(dataList[i])
    }
  }

  reportIdle<T>(...dataList: T[]) {
    if (dataList.length === 0) return

    let end = this.concurrentRequests
    let start = 0

    // 根据并发数来拆分队列
    const splitReportByConcurrent = () => {
      this.pushReportQueue(...dataList.slice(start, end))
      start += this.concurrentRequests
      end += this.concurrentRequests
    }
    splitReportByConcurrent()
    // 请求定义
    const concurrentReportHandler = async () => {
      await Promise.allSettled([...this.reportQueue.map(data => this.fetcher(data as Object))])
        .then(resList => {
          // 清除队列中已经请求成功的，为下一次 report 做准备
          let queueCurrentIdx = 0
          resList.map((res, idx) => {
            if (res.status === 'fulfilled' && this.afterFetcher(res.value)) {
              this.reportQueue.splice(idx - queueCurrentIdx, 1)
              queueCurrentIdx++
            }
          })
          // 所有请求完成后，再次拆分队列，直到没有为止
          splitReportByConcurrent()
        })
        .catch(err => {
          if (this.retryTimes <= this.retryTimesLimit) {
            window.requestIdleCallback(idlehandler, {timeout: this.finalTime})
          }
        })
    }

    // 递归调度
    const idlehandler = async (idleDeadline: IdleDeadline) => {
      const stillTime = idleDeadline.timeRemaining()
      const queueSize = this.reportQueue.length
      // 调度策略
      if (stillTime < 50 && stillTime > 5 && queueSize <= 3) {
        await concurrentReportHandler()
      } else if (stillTime >= 50) {
        await concurrentReportHandler()
      }
      // 清空队列则跳出递归
      if (this.reportQueue.length === 0) return
      // 时间不够就下一次 loop
      window.requestIdleCallback(idlehandler)
    }

    // 执行
    if ('requestIdleCallback' in (globalThis ?? window)) {
      if (this.finalTime > 0) {
        window.requestIdleCallback(idlehandler, {timeout: this.finalTime})
      } else {
        window.requestIdleCallback(idlehandler)
      }
    }
  }

  // 设置重试次数
  setRetryTimesLimit(maxRetryTimesLimit: number) {
    if (isNaN(Number(maxRetryTimesLimit))) return
    this.retryTimesLimit = maxRetryTimesLimit
  }

  // TODO
  reportImmediately<T>(...dataList: T[]) {}
}
