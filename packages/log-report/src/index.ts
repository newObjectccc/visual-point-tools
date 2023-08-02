import WebLogger from "packages/logger/src/logger";
import type { LogType, Logs } from "packages/logger/src/logger";
import WebReporter from "packages/reporter/src/reporter"

export type LogReportFetcherType = <T extends Object>(data: T) => boolean | Promise<boolean>
interface LogReportOptions {
  url: string
  type: LogType
  fetcher?: LogReportFetcherType
  afterFetcher?: LogReportFetcherType
  customOptionFetcher?: RequestInit
  concurrent?: number
  finalTime?: number
  retryTimesLimit?: number
}
export default class LogReport<T extends Object> {
  private url: string
  private type: LogType
  private logs?: Logs<T>
  private fetcher?: LogReportFetcherType
  private afterFetcher?: LogReportFetcherType
  private customOptionFetcher?: RequestInit
  private concurrent?: number
  private finalTime?: number
  private retryTimesLimit?: number
  private __reporter
  private __logger

  constructor({url, type, customOptionFetcher, afterFetcher, concurrent, fetcher, finalTime, retryTimesLimit}: LogReportOptions) {
    this.url = url
    this.type = type
    try {
      this.__logger = new WebLogger<T>({type})
      this.__reporter = new WebReporter({reportUrl: url, customOptionFetcher, afterFetcher, concurrent, fetcher, finalTime, retryTimesLimit})
      this.logs = this.__logger.getLogsQueue()
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('LogReport Error: ', error)
      }
      return
    }
  }

  report() {
    const logList = this.__logger?.getLogsQueue() ?? []
    this.__reporter?.reportIdle(...logList)
  }

  changeUrl(url: string) {
    this.__reporter?.changeReportUrl(url)
  }

  createLog(data: T) {
    this.__logger?.generateLog(data)
  }

  setReportRetryLimit(limit: number) {
    this.__reporter?.setRetryTimesLimit(limit)
  }
}