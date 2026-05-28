import { describe, it, expect } from 'vitest'

describe('XML Frontend', () => {
  it('debe crear un Blob XML descargable', () => {
    const xml = '<?xml version="1.0" encoding="UTF-8"?><export><activities></activities></export>'
    const blob = new Blob([xml], { type: 'application/xml' })
    expect(blob.type).toBe('application/xml')
    expect(blob.size).toBeGreaterThan(0)
  })

  it('debe generar URL de descarga para XML', () => {
    const xml = '<?xml version="1.0"?><export></export>'
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    expect(url).toContain('blob:')
    URL.revokeObjectURL(url)
  })

  it('debe leer contenido de archivo XML como texto', async () => {
    const xml = '<?xml version="1.0"?><export><test>hello</test></export>'
    const blob = new Blob([xml], { type: 'application/xml' })
    const text = await blob.text()
    expect(text).toContain('<test>hello</test>')
  })
})
