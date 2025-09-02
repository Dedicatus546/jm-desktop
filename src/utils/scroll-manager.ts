import { RouterScrollBehavior } from 'vue-router'

interface Position {
  top: number
  left: number
}

class ScrollManager {
  #elId: string
  #scrollPosition: Record<
    string,
    Position | undefined
  > = {}

  constructor(elId: string) {
    this.#elId = elId
  }

  get #scrollEl() {
    return document.getElementById(this.#elId) as HTMLDivElement
  }

  getPosition(key: string) {
    return this.#scrollPosition[key]
  }

  setPosition(key: string, position: Position) {
    this.#scrollPosition[key] = position
    console.log(this.#scrollPosition)
  }

  getScrollBehavior(): RouterScrollBehavior {
    return async (to) => {
      const scrollEl = this.#scrollEl
      if (!scrollEl) {
        return
      }
      const position = this.getPosition(to.fullPath)
      if (position) {
        scrollEl.scrollTo({
          top: position.top,
          left: position.left,
        })
      }
      else {
        scrollEl.scrollTo({
          top: 0,
          left: 0,
        })
      }
    }
  }
}

export const scrollManager = new ScrollManager('scroll-view')
