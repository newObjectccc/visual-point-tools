import { uploadByFetch } from "packages/tools/src"

interface Logger {
  url?: string
  genPipeline?: PipelineHandler[]
}

export type Logs<T> = T[]
type UploadHandler = <T>(data: T, opt?: RequestInit) => Promise<boolean>
type PipelineHandler = <T extends Object>(data: T) => T
type UploadCallback = <T extends Object>(data: T) => boolean | Promise<boolean>
export type LogType = 'info' | 'warn' | 'error' | 'business' | 'perf'

const urlRegExp = /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/

interface WebLoggerOptions {
  type?: LogType // logger 实例类型
  url?: string // 上报的 url，这个字段和默认处理函数耦合，如果用 Reporter 或自定义的上传处理函数则可以不传
  uploadHandler?: UploadHandler // 上报的处理函数，必须返回 Promise
  uploadCallback?: UploadCallback // 上报接口后的回调，接收接口返回参数，需要显示返回至少是可转换成 boolean 的值，用于Logger内部判断上报是否成功，成功则删除该 log
}
export default class WebLogger<T> implements Logger {
  url?: string
  private logType: LogType
  private logs: Logs<T>
  genPipeline: PipelineHandler[]
  uploadHandler: UploadHandler
  // uploadCallback 如果传入了，会用于帮助用户手动判断上传是否有效，通过函数返回值判定是否需要清除 this.logs 中已上传的 log
  uploadCallback?: UploadCallback

  constructor(options: WebLoggerOptions = {}) {
    const {url, type, uploadCallback, uploadHandler} = options
    if (url && !urlRegExp.test(url)) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('WebLogger: first argments is invalid, it should be a uri')
      }
    }
    if (uploadHandler && typeof uploadHandler !== 'function') {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('WebLogger: second argument must be a function')
      }
    }
    this.logType = type ?? 'info'
    this.url = url
    this.logs = []
    this.genPipeline = []
    this.uploadHandler = uploadHandler ?? uploadByFetch
    this.uploadCallback = uploadCallback
  }

  // 生成 log
  generateLog<T extends Object>(body: T, autoExec: boolean = true) {
    const _this = this
    let res = null

    // 通过pipeline执行一些针对日志的优化逻辑，例如去重、压缩、截断等
    const convertPipeline = function* () {
      let data = body
      if (_this.genPipeline.length > 0) {
        for (const func of _this.genPipeline) {
          data = func(data)
          yield data
        }
      } else {
        yield data
      }
    }

    // 默认推荐自动执行 pipeline，如果耗时长再推荐使用手动 pipeline
    if (autoExec) {
      const gens = convertPipeline()
      do {
        res = gens.next().value as any
      } while (!gens.next().done)
      // 只有经过 pipeline 之后仍然有效的 log，才会被添加到 logs 队列中
      res && this.logs.push(res)
    } else {
      // 手动控制日志生成，则需要手动推入logs队列，只有当你 pipeline 耗时很长时需要使用
      res = convertPipeline()
    }
    return res
  }

  // 添加 pipeline 处理函数，可以是用于数据转换，数据过滤，数据分析，处理函数中必须显示返回处理后的 log
  pushPipeline(...restFunc: PipelineHandler[]) {
    for (const func of restFunc) {
      this.genPipeline.push(func)
    }
  }

  // 删除 pipeline，只提供从最后一个开始删除
  popPipeline() {
    this.genPipeline.pop()
  }

  // 上传 logs 队列中的 log，autoExec = false 可以手动控制上传
  async uploadLogs(opt?: RequestInit, autoExec: boolean = true) {
    const logsLens = this.logs.length
    if (logsLens === 0) return
    const _this = this
    function* iteratorLoopByPriority() {
      loopListByPriority: for (let i = logsLens - 1; i >= 0; i--) {
        const log = _this.logs[i]
        yield _this
          .uploadHandler(log, opt)
          .then(res => {
            // 上传成功则删除，默认服务器回复不为空则上传成功
            const checkUploadIsSuccessful = typeof _this.uploadCallback === 'function' ? _this.uploadCallback(res) : res
            if (checkUploadIsSuccessful) {
              // 删除逻辑
              _this.logs.splice(
                _this.logs.findIndex(item => item === log),
                1,
              )
            }
          })
          .catch(err => _this.uploadCallback?.(err))
      }
    }
    if (autoExec) {
      // 不可中断
      const generator = iteratorLoopByPriority()
      while (!generator.next().done) {
        generator.next()
      }
      return true
    } else {
      // 可中断，可自行优化，不过建议使用 WebReporter
      return iteratorLoopByPriority()
    }
  }

  // 按FIFO取出lgos
  getCurrnetLog() {
    return this.logs.shift()
  }

  // 获取logs的size
  getLogsSize() {
    return this.logs.length
  }

  // 获取整个队列
  getLogsQueue() {
    return this.logs
  }

  // 获取当前实例 logType
  getLogType() {
    return this.logType
  }
}