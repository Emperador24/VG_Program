import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Reportes() {
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchReportes()
  }, [])

  const fetchReportes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/reportes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setReportes(Array.isArray(data) ? data.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en)) : [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDescargar = async (reporte) => {
    alert(`Descargando reporte ${reporte.tipo} del ${reporte.periodo_inicio}...`)
  }

  const columns = [
    { key: 'tipo', label: 'TIPO', render: (val) => val.charAt(0).toUpperCase() + val.slice(1) },
    { key: 'periodo_inicio', label: 'PERIODO' },
    { key: 'periodo_fin', label: 'HASTA' },
    { key: 'creado_en', label: 'GENERADO' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>
          Reportes
        </h1>
        <button
          onClick={fetchReportes}
          className="px-4 py-2 rounded text-sm font-bold text-white transition-all"
          style={{ background: '#d4a03a', color: '#0e0f11' }}
          onMouseEnter={(e) => (e.target.style.background = '#c89c2f')}
          onMouseLeave={(e) => (e.target.style.background = '#d4a03a')}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Información */}
      <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        <p className="text-sm text-gray-300">
          📊 Reportes automáticos generados por el sistema:
        </p>
        <ul className="mt-3 space-y-1 text-xs text-gray-400">
          <li>• <span style={{ color: '#d4a03a' }}>Diarios</span>: Cada día a las 19:00</li>
          <li>• <span style={{ color: '#d4a03a' }}>Semanales</span>: Cada domingo a las 20:00</li>
          <li>• <span style={{ color: '#d4a03a' }}>Mensuales</span>: Día 1 de cada mes a las 06:00</li>
        </ul>
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando reportes...</p>
      ) : reportes.length === 0 ? (
        <p className="text-gray-400">Sin reportes aún. Se generarán automáticamente.</p>
      ) : (
        <div className="overflow-x-auto rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <table className="w-full text-sm">
            <thead style={{ background: '#0e0f1180' }}>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="text-left p-3" style={{ color: '#d4a03a' }}>
                    {col.label}
                  </th>
                ))}
                <th className="text-center p-3" style={{ color: '#d4a03a' }}>
                  DESCARGAR
                </th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((reporte) => (
                <tr key={reporte.id} style={{ borderBottom: '1px solid #2e3238' }}>
                  {columns.map((col) => (
                    <td key={col.key} className="p-3 text-gray-300">
                      {col.render ? col.render(reporte[col.key], reporte) : reporte[col.key]}
                    </td>
                  ))}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDescargar(reporte)}
                      className="inline text-blue-500 hover:text-blue-400"
                      title="Descargar reporte"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
