import Visual from './visual'
import Pointing from './pointing'
import type {FetcherType, KeyValueType, PointingHandlerCallback} from './pointing'
// import point from './point'

interface VisualPointOptions {
  className?: string
  keyValue?: KeyValueType
  fetcher: FetcherType
}
/**
 * [VisualPoint description]
 * data-vpKey string 可视化埋点平台和具体项目对应的埋点key
 * data-vpVal boolean 可视化埋点平台和具体项目对应的埋点值(是否触发)
 */
export default class VisualPoint {
  private __pointingInstance
  private __visualInstance
  private className: string
  private keyValue: KeyValueType

  constructor({className = 'vp__span-visual', keyValue = {key: 'vpkey', value: 'vpval'}, fetcher}: VisualPointOptions) {
    const visualIns = new Visual({className, keyValue})
    const pointingIns = new Pointing({className, fetcher, keyValue})
    this.className = className
    this.keyValue = keyValue
    this.__pointingInstance = pointingIns
    this.__visualInstance = visualIns
  }

  registerListenerAndStyles() {
    this.__pointingInstance.ponintingClickListener()
    this.__visualInstance.registerVisualStyles()
  }

  appendVisualPointDom() {
    this.__visualInstance.appendVisualDom()
  }

  changeVisualPointState(dataKey: string, value: string|boolean) {
    this.__visualInstance.changeVisualDomVpValue(dataKey, value)
  }
}
