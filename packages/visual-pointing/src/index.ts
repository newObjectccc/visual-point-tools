import Visual from './visual'
import Pointing from './pointing'
import type {FetcherType, KeyValueType} from './pointing'
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
  private pointingInstance
  private visualInstance
  private className: string
  private keyValue: KeyValueType

  constructor({className = '__vp-visual', keyValue = {key: '*[data-vpkey]', value: '*[data-vpval]'}, fetcher}: VisualPointOptions) {
    const visualIns = new Visual({className, dataset: keyValue.key})
    const pointingIns = new Pointing({className, fetcher, keyValue})
    this.className = className
    this.keyValue = keyValue
    this.pointingInstance = pointingIns
    this.visualInstance = visualIns
  }

  registerClickListener() {
    this.pointingInstance.ponintingClickListener()
  }

  appendVisualPointDom() {
    this.visualInstance.appendVisualDom()
  }
}
