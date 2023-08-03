import WebLogger from "packages/logger/src/logger";
import type { LogType, Logs } from "packages/logger/src/logger";
import WebReporter from "packages/reporter/src/reporter"

export type LogReportFetcherType<T extends Object> = (data: T) => boolean | Promise<boolean>
export type CeateLogCallback = <T>(logs: Logs<T>) => void
interface LogReportOptions {
  url: string
  type: LogType
  fetcher?: LogReportFetcherType<{}>
  afterFetcher?: LogReportFetcherType<{}>
  customOptionFetcher?: RequestInit
  concurrent?: number
  finalTime?: number
  retryTimesLimit?: number
  onCreateLogCallback?: CeateLogCallback
}
export default class LogReport<T extends Object> {
  private url: string
  private type: LogType
  private fetcher?: LogReportFetcherType<T>
  private afterFetcher?: LogReportFetcherType<T>
  private customOptionFetcher?: RequestInit
  private concurrent?: number
  private finalTime?: number
  private retryTimesLimit?: number
  private onCreateLogCallback?: CeateLogCallback
  private __reporter
  private __logger

  constructor({onCreateLogCallback, url, type, customOptionFetcher, afterFetcher, concurrent, fetcher, finalTime, retryTimesLimit}: LogReportOptions) {
    this.url = url
    this.type = type
    this.onCreateLogCallback = onCreateLogCallback
    try {
      this.__logger = new WebLogger<T>({type})
      this.__reporter = new WebReporter({reportUrl: url, customOptionFetcher, afterFetcher, concurrent, fetcher, finalTime, retryTimesLimit})
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('LogReport Error: ', error)
      }
      return
    }
  }

  report() {
    const logList = []
    while(this.__logger?.getLogsSize()! > 0) {
      const log = this.__logger?.getCurrnetLog()
      logList.push(log)
    }
    this.__reporter?.reportIdle(...logList)
  }

  changeUrl(url: string) {
    this.__reporter?.changeReportUrl(url)
  }

  createLog(data: T) {
    this.__logger?.generateLog(data)
    this.onCreateLogCallback?.(this.__logger?.getLogsQueue() as T[])
  }

  setReportRetryLimit(limit: number) {
    this.__reporter?.setRetryTimesLimit(limit)
  }
}
