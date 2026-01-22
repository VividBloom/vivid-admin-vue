import { ref, onUnmounted, type Ref } from 'vue'

export function useWatermark(
  appendEl: Ref<HTMLElement | null> = ref(document.body),
  id: string = '1.2.3.4.5.6'
) {
  const watermarkEl = ref<HTMLElement | null>(null)
  let observer: MutationObserver | null = null

  const clear = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    const domId = document.getElementById(id)
    if (domId) {
      const parent = domId.parentNode
      if (parent) {
        parent.removeChild(domId)
      }
    }
  }

  const createWatermark = (str: string, opacity: number = 0.5) => {
    const domId = document.getElementById(id)
    if (domId) {
      const parent = domId.parentNode
      if (parent) {
        parent.removeChild(domId)
      }
    }

    const can = document.createElement('canvas')
    can.width = 300
    can.height = 240

    const cans = can.getContext('2d')
    if (cans) {
      cans.rotate((-20 * Math.PI) / 180)
      cans.font = '15px Verdana'
      cans.fillStyle = `rgba(200, 200, 200, ${opacity})`
      cans.textAlign = 'left'
      cans.textBaseline = 'middle'
      cans.fillText(str, can.width / 20, can.height)
    }

    const div = document.createElement('div')
    div.id = id
    div.style.pointerEvents = 'none'
    div.style.top = '0px'
    div.style.left = '0px'
    div.style.position = 'absolute'
    div.style.zIndex = '100000'
    div.style.width = '100%'
    div.style.height = '100%'
    div.style.background = 'url(' + can.toDataURL('image/png') + ') left top repeat'

    if (appendEl.value) {
      appendEl.value.style.position = 'relative'
      appendEl.value.appendChild(div)
      watermarkEl.value = div
    }
  }

  const setWatermark = (str: string, opacity: number = 0.3) => {
    clear()
    createWatermark(str, opacity)

    // 监听DOM变化，防止水印被删除
    observer = new MutationObserver(() => {
      const dom = document.getElementById(id)
      if (!dom && appendEl.value) {
        createWatermark(str, opacity)
      }
    })

    if (appendEl.value) {
      observer.observe(appendEl.value, {
        childList: true,
        attributes: true,
        subtree: true,
      })
    }
  }

  onUnmounted(() => {
    clear()
  })

  return { setWatermark, clear }
}
