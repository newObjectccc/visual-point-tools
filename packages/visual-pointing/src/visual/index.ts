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
  
  appendVisualDom() {
    const allNodesWithDatasetVp: NodeListOf<HTMLElement> = document.querySelectorAll(this.keyValue.key)
    const visualSpan = document.createElement('span')
    // TODO: cutom style
    visualSpan.classList.add(this.className)
    visualSpan.innerHTML = this.keyValue.value === 'true' ? 'A' : 'D'
    visualSpan.style.position = 'absolute'
    visualSpan.style.right = '-9px'
    visualSpan.style.top = '-9px'
    visualSpan.style.color = '#fff'
    visualSpan.style.width = '18px'
    visualSpan.style.height = '18px'
    visualSpan.style.lineHeight = '18px'
    visualSpan.style.fontSize = '9px'
    visualSpan.style.textAlign = 'center'
    visualSpan.style.background = this.keyValue.value === 'true' ? 'rgb(55, 205, 55)' : 'rgb(205, 55, 55)'
    visualSpan.style.borderRadius = '50%'
    visualSpan.style.cursor = 'pointer'
    allNodesWithDatasetVp.forEach((_node, _key, _parent) => {
      _node?.appendChild(visualSpan)
      _node.style.position = 'relative'
    })
  }
}