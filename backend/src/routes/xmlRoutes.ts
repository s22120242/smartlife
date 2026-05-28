import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { xmlService } from '../services/xmlService'

const router = Router()

router.use(authMiddleware)

router.get('/export', async (req, res) => {
  try {
    const userId = (req as any).userId
    const xml = await xmlService.exportData(userId)
    res.set('Content-Type', 'application/xml')
    res.set('Content-Disposition', 'attachment; filename="smartlife-export.xml"')
    res.send(xml)
  } catch {
    res.status(500).json({ error: 'Error al exportar XML' })
  }
})

router.post('/import', async (req, res) => {
  try {
    const userId = (req as any).userId
    const xml = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const result = await xmlService.importData(userId, xml)
    res.json({ message: 'Importación completada', imported: result })
  } catch (err: any) {
    if (err.message?.startsWith('Formato XML inválido')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: 'Error al importar XML' })
  }
})

export default router
