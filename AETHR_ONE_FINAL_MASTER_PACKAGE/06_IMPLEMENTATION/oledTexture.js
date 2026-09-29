// Minimal dynamic OLED CanvasTexture helper.
import * as THREE from 'three'

export function createOledTexture(size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  function draw({ main = '--°', sub = '' } = {}) {
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = '#050607'
    ctx.fillRect(0, 0, size, size)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillStyle = '#f4f7f8'
    ctx.font = `500 ${Math.round(size * 0.22)}px Arial`
    ctx.fillText(main, size / 2, size * 0.46)

    if (sub) {
      ctx.fillStyle = 'rgba(244,247,248,.68)'
      ctx.font = `500 ${Math.round(size * 0.055)}px Arial`
      ctx.fillText(sub.toUpperCase(), size / 2, size * 0.67)
    }

    texture.needsUpdate = true
  }

  draw()
  return { canvas, texture, draw }
}
