import { KeyValueType } from "packages/visual-pointing/src/pointing";

interface VisualOptions {
  className: string;
  keyValue: KeyValueType
}
export default class Visual {
  private className: string
  private keyValue: KeyValueType

  constructor({className, keyValue}: VisualOptions) {
    this.className = className
    this.keyValue = keyValue
  }
  
  // 只是用于预埋点的开关状态
  appendVisualDom() {
    const allNodesWithDatasetVp: NodeListOf<HTMLElement> = document.querySelectorAll(`*[data-${this.keyValue.key}]`)
    allNodesWithDatasetVp.forEach((_node, _key, _parent) => {
      const vpValue = _node.getAttribute(`data-${this.keyValue.value}`)
      // TODO: cutom style
      const visualSpan = document.createElement('span')
      visualSpan.classList.add(this.className)
      visualSpan.style.content = vpValue?.toString() === 'true' ? 'A' : 'D'
      visualSpan.style.position = 'absolute'
      visualSpan.style.right = '-9px'
      visualSpan.style.top = '-9px'
      visualSpan.style.color = '#fff'
      visualSpan.style.width = '18px'
      visualSpan.style.height = '18px'
      visualSpan.style.lineHeight = '18px'
      visualSpan.style.fontSize = '9px'
      visualSpan.style.textAlign = 'center'
      visualSpan.style.background = vpValue?.toString() === 'true' ? 'rgb(55, 205, 55)' : 'rgb(205, 55, 55)'
      visualSpan.style.borderRadius = '50%'
      visualSpan.style.cursor = 'pointer'
      _node.style.position = 'relative'
      _node?.appendChild(visualSpan)
    })
  }

  // change 预埋点状态
  changeVisualDomVpValue(dataKey: string, value: boolean|string) {
    if (!dataKey) return
    const val = value.toString()
    const domList = document.querySelectorAll(`*[data-${dataKey}]`)
    domList.forEach((_node, _key, _parent) => {
      _node.setAttribute(`data-${this.keyValue.value}`, val)
    })
  }

  // 注册样式
  registerVisualStyles() {
    const vpStyles = document.createElement('style')
    vpStyles.innerHTML = `
      *[data-${this.keyValue.value}="true"] {
        background-color: rgb(55, 205, 55);
        content: "A";
      }
      *[data-${this.keyValue.value}="false"] {
        background-color: rgb(205, 55, 55);
        content: "D";
      }
    `
    document.head.appendChild(vpStyles)
  }
}