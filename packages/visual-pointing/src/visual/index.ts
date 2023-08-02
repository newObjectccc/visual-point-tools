interface VisualOptions {
  className: string;
  dataset: string
}
export default class Visual {
  private className: string
  private dataset: string

  constructor({className, dataset}: VisualOptions) {
    this.className = className
    this.dataset = dataset
  }
  
  appendVisualDom() {
    const allNodesWithDatasetVp: NodeListOf<HTMLElement> = document.querySelectorAll(this.dataset)
    const visualSpan = document.createElement('span')
    // TODO: cutom style
    visualSpan.classList.add(this.className)
    visualSpan.innerHTML = '0'
    visualSpan.style.position = 'absolute'
    visualSpan.style.right = '-9px'
    visualSpan.style.top = '-9px'
    visualSpan.style.color = '#fff'
    visualSpan.style.width = '18px'
    visualSpan.style.height = '18px'
    visualSpan.style.lineHeight = '18px'
    visualSpan.style.fontSize = '9px'
    visualSpan.style.textAlign = 'center'
    visualSpan.style.background = 'rgb(238, 55, 55)'
    visualSpan.style.borderRadius = '50%'
    visualSpan.style.cursor = 'pointer'
    allNodesWithDatasetVp.forEach((_node, _key, _parent) => {
      _node?.appendChild(visualSpan)
      _node.style.position = 'relative'
    })
  }
}