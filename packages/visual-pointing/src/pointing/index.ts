export type KeyValueType = {key: string; value: string} 
export type FetcherType = <T>(hash: string, required: boolean) => Promise<T>
export type PointingHandlerCallback = (tar: HTMLElement, pElem: HTMLElement, res: Promise<any>) => void
export interface PointingOptions {
  className: string;
  fetcher: FetcherType
  keyValue: KeyValueType
  pointingHandlerCallback?: PointingHandlerCallback // pointing请求后，决定是否修改 vpval 的值
}
export default class Pointing {
  private className: string
  private fetcher: FetcherType
  private keyValue: KeyValueType
  private isListening: boolean
  private pointingHandlerCallback?: PointingHandlerCallback

  constructor({className, fetcher, keyValue, pointingHandlerCallback}: PointingOptions) {
    this.className = className
    this.fetcher = fetcher
    this.keyValue = keyValue
    this.isListening = false
    this.pointingHandlerCallback = pointingHandlerCallback
  }

  async pointingHandler(evt: MouseEvent) {
    const target = evt.target as HTMLElement
    const classList = target.classList.value.split(' ')
    const parentElem = target.parentElement!
    let res = null
    if (classList.includes(this.className)) {
      const hashKey: string = parentElem.dataset[this.keyValue.key]!
      const required: boolean = !!parentElem.dataset[this.keyValue.value]
      try {
        res = await this.fetcher?.(hashKey, required)
        this.pointingHandlerCallback?.(target, parentElem, res as Promise<any>)
      } catch (error) {
        console.error('VP Error: ', error) 
      }
    }
    return res
  }
  
  ponintingClickListener() {
    if (this.isListening) return
    document.addEventListener('click', evt => this.pointingHandler(evt))
    this.isListening = true
  }
}
