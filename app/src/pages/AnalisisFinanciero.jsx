import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function AnalisisFinanciero() {
  const [periodo, setPeriodo] = useState({
    inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  })
  const [resumen, setResumen] = useState(null)
  const [porMaquina, setPorMaquina] = useState([])
  const [porCliente, setPorCliente] = useState([])
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')

  const fetchAnalisis = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/dashboard/analisis?inicio=${periodo.inicio}&fin=${periodo.fin}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setResumen(data.resumen)
      setPorMaquina(data.porMaquina || [])
      setPorCliente(data.porCliente || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalisis()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>
        📊 Análisis Financiero
      </h1>

      {/* PERÍODO */}
      <div className="flex gap-3 p-3 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        <input type="date" value={periodo.inicio} onChange={(e) => setPeriodo({ ...periodo, inicio: e.target.value })} className="p-2 rounded text-sm flex-1" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
        <input type="date" value={periodo.fin} onChange={(e) => setPeriodo({ ...periodo, fin: e.target.value })} className="p-2 rounded text-sm flex-1" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
        <button onClick={fetchAnalisis} disabled={loading} className="px-4 py-2 rounded font-bold text-white" style={{ background: '#d4a03a', color: '#0e0f11' }}>
          {loading ? 'Cargando...' : 'Buscar'}
        </button>
      </div>

      {resumen && (
        <>
          {/* RESUMEN */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Ingresos', value: `$${resumen.ingresos.toFixed(2)}`, color: '#5fa3b5' },
              { label: 'Gastos', value: `$${resumen.gastos.toFixed(2)}`, color: '#d4a03a' },
              { label: 'Nómina', value: `$${resumen.nomina.toFixed(2)}`, color: '#f07a35' },
              { label: 'Ganancia Neta', value: `$${resumen.ganancia.toFixed(2)}`, color: resumen.ganancia >= 0 ? '#4cb07a' : '#ef6b5e' }
            ].map(item => (
              <div key={item.label} className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* GRÁFICO POR MÁQUINA */}
          {porMaquina.length > 0 && (
            <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
              <h2 className="text-lg font-bold mb-3" style={{ color: '#d4a03a' }}>Por Máquina</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={porMaquina}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e3238" />
                  <XAxis dataKey="codigo" stroke="#a3aab3" />
                  <YAxis stroke="#a3aab3" />
                  <Tooltip contentStyle={{ background: '#181a1e', border: '1px solid #2e3238' }} />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#5fa3b5" />
                  <Bar dataKey="gastos" fill="#d4a03a" />
                  <Bar dataKey="ganancia" fill="#4cb07a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* TABLA POR CLIENTE */}
          {porCliente.length > 0 && (
            <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
              <h2 className="text-lg font-bold mb-3" style={{ color: '#d4a03a' }}>Por Cliente</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2e3238' }}>
                      <th className="text-left p-2" style={{ color: '#d4a03a' }}>Cliente</th>
                      <th className="text-right p-2" style={{ color: '#d4a03a' }}>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porCliente.map(c => (
                      <tr key={c.nombre} style={{ borderBottom: '1px solid #2e3238' }}>
                        <td className="p-2 text-gray-300">{c.nombre}</td>
                        <td className="p-2 text-right font-bold" style={{ color: '#d4a03a' }}>${c.ingresos.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
