import { useEffect, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({
    gastoHoy: 0,
    gastoSemana: 0,
    gastoMes: 0,
    ingresosMes: 0,
    ganancia: 0,
  })
  const [flota, setFlota] = useState([])
  const [alertas, setAlertas] = useState([])
  const [gastosPorCategoria, setGastosPorCategoria] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    // Fetch dashboard data
    fetch(`${API_URL}/dashboard/kpis`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setKpis({
          gastoHoy: data.gastoHoy || 0,
          gastoSemana: data.gastoSemana || 0,
          gastoMes: data.gastoMes || 0,
          ingresosMes: data.ingresosMes || 0,
          ganancia: (data.ingresosMes || 0) - (data.gastoMes || 0),
        })
      })
      .catch(err => console.error('KPI Error:', err))

    // Fetch flota hoy
    fetch(`${API_URL}/maquinas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFlota(data.slice(0, 5)))
      .catch(err => console.error('Flota Error:', err))

    // Fetch gastos por categoría
    fetch(`${API_URL}/dashboard/gastos-categoria`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setGastosPorCategoria(data || []))
      .catch(err => console.error('Gastos Categoria Error:', err))

    // Fetch alertas
    fetch(`${API_URL}/dashboard/alertas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAlertas(data || []))
      .catch(err => console.error('Alertas Error:', err))

    setLoading(false)
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Cargando...</div>
  }

  const estadosColor = {
    trabajando: '#4cb07a',
    taller: '#f07a35',
    parada: '#ef6b5e'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>
        Dashboard
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <p className="text-xs text-gray-400 mb-1">GASTO HOY</p>
          <p className="text-2xl font-bold" style={{ color: '#d4a03a' }}>
            ${kpis.gastoHoy.toFixed(2)}
          </p>
        </div>

        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <p className="text-xs text-gray-400 mb-1">GASTO SEMANA</p>
          <p className="text-2xl font-bold" style={{ color: '#d4a03a' }}>
            ${kpis.gastoSemana.toFixed(2)}
          </p>
        </div>

        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <p className="text-xs text-gray-400 mb-1">GASTO MES</p>
          <p className="text-2xl font-bold" style={{ color: '#d4a03a' }}>
            ${kpis.gastoMes.toFixed(2)}
          </p>
        </div>

        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <p className="text-xs text-gray-400 mb-1">INGRESOS MES</p>
          <p className="text-2xl font-bold" style={{ color: '#5fa3b5' }}>
            ${kpis.ingresosMes.toFixed(2)}
          </p>
        </div>

        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <p className="text-xs text-gray-400 mb-1">GANANCIA MES</p>
          <p className={`text-2xl font-bold ${kpis.ganancia >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${kpis.ganancia.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flota Hoy */}
        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#d4a03a' }}>
            Flota Hoy
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {flota.length > 0 ? (
              flota.map(maquina => (
                <div key={maquina.id} className="flex justify-between text-sm p-2 rounded" style={{ background: '#0e0f1140' }}>
                  <span className="text-gray-200">{maquina.codigo || 'N/A'}</span>
                  <span style={{ color: estadosColor[maquina.estado] || '#a3aab3' }}>
                    {maquina.estado || 'Sin asignar'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Sin máquinas</p>
            )}
          </div>
        </div>

        {/* Alertas */}
        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#d4a03a' }}>
            Alertas
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alertas.length > 0 ? (
              alertas.map((alerta, idx) => (
                <div key={idx} className="p-2 rounded text-sm" style={{ background: '#f07a3520', color: '#f07a35' }}>
                  ⚠️ {alerta}
                </div>
              ))
            ) : (
              <p className="text-gray-400">Sin alertas</p>
            )}
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {gastosPorCategoria.length > 0 && (
        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#d4a03a' }}>
            Gastos por Categoría
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={gastosPorCategoria} dataKey="value" label nameKey="nombre">
                {gastosPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#d4a03a', '#5fa3b5', '#4cb07a', '#f07a35', '#ef6b5e'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
