import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Ingresos() {
  const [clientes, setClientes] = useState([])
  const [horas, setHoras] = useState([])
  const [ingresos, setIngresos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [periodo, setPeriodo] = useState({
    inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  })
  const [showForm, setShowForm] = useState(false)
  const [formIngreso, setFormIngreso] = useState({ fecha: new Date().toISOString().split('T')[0], concepto: '', estado_cobro: 'pendiente' })
  const [guardando, setGuardando] = useState(false)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchClientes()
  }, [])

  useEffect(() => {
    if (selectedCliente) {
      fetchHoras(selectedCliente)
    }
  }, [selectedCliente, periodo])

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } })
      setClientes(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchHoras = async (cliente_id) => {
    try {
      const res = await fetch(`${API_URL}/clientes-contratos/horas/${cliente_id}/${periodo.inicio}/${periodo.fin}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      const data = await res.json()
      setHoras(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRegistrarIngreso = async (e) => {
    e.preventDefault()
    if (!selectedCliente || horas.length === 0) {
      alert('Selecciona cliente y verifica que haya horas registradas')
      return
    }

    setGuardando(true)
    try {
      // Calcular total ingreso
      const totalIngreso = horas.reduce((sum, h) => sum + parseFloat(h.monto_calculado || 0), 0)

      const res = await fetch(`${API_URL}/ingresos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fecha: formIngreso.fecha,
          cliente_id: selectedCliente,
          maquina_id: null, // No se usa aquí, se agrega desde horas
          concepto: formIngreso.concepto || `Servicios ${periodo.inicio} a ${periodo.fin}`,
          monto_usd: totalIngreso,
          estado_cobro: formIngreso.estado_cobro
        })
      })

      if (res.ok) {
        setFormIngreso({ fecha: new Date().toISOString().split('T')[0], concepto: '', estado_cobro: 'pendiente' })
        setSelectedCliente(null)
        setHoras([])
        setShowForm(false)
        alert(`Ingreso de $${totalIngreso.toFixed(2)} registrado`)
        fetchClientes()
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const calcularTotalPeriodo = () => {
    return horas.reduce((sum, h) => sum + parseFloat(h.monto_calculado || 0), 0).toFixed(2)
  }

  if (loading) return <p className="text-gray-400">Cargando...</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>Ingresos</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white" style={{ background: '#d4a03a', color: '#0e0f11' }}>
          <Plus size={16} /> Nuevo Ingreso
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded space-y-4" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <h2 className="text-lg font-bold" style={{ color: '#d4a03a' }}>Registrar Ingreso desde Horas</h2>

          {/* PERÍODO */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs" style={{ color: '#a3aab3' }}>Desde</label>
              <input 
                type="date" 
                value={periodo.inicio} 
                onChange={(e) => setPeriodo({ ...periodo, inicio: e.target.value })} 
                className="w-full p-2 rounded text-sm mt-1"
                style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: '#a3aab3' }}>Hasta</label>
              <input 
                type="date" 
                value={periodo.fin} 
                onChange={(e) => setPeriodo({ ...periodo, fin: e.target.value })} 
                className="w-full p-2 rounded text-sm mt-1"
                style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: '#a3aab3' }}>Cliente *</label>
              <select 
                value={selectedCliente || ''} 
                onChange={(e) => setSelectedCliente(parseInt(e.target.value))} 
                className="w-full p-2 rounded text-sm mt-1"
                style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
              >
                <option value="">Selecciona Cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* TABLA DE HORAS POR MÁQUINA */}
          {selectedCliente && horas.length > 0 && (
            <div className="p-3 rounded" style={{ background: '#0e0f1140' }}>
              <h3 className="font-bold mb-3" style={{ color: '#d4a03a' }}>Horas Trabajadas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2e3238' }}>
                      <th className="text-left p-2" style={{ color: '#d4a03a' }}>Fecha</th>
                      <th className="text-left p-2" style={{ color: '#d4a03a' }}>Máquina</th>
                      <th className="text-center p-2" style={{ color: '#d4a03a' }}>Horas</th>
                      <th className="text-center p-2" style={{ color: '#d4a03a' }}>Turno</th>
                      <th className="text-right p-2" style={{ color: '#d4a03a' }}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horas.map(h => (
                      <tr key={h.id} style={{ borderBottom: '1px solid #2e3238' }}>
                        <td className="p-2 text-gray-300">{h.fecha}</td>
                        <td className="p-2 text-gray-300"><strong>{h.placa}</strong> ({h.tipo})</td>
                        <td className="p-2 text-center">{h.horas_trabajadas}</td>
                        <td className="p-2 text-center">{h.es_noche ? '🌙 Noche' : '☀️ Día'}</td>
                        <td className="p-2 text-right font-bold" style={{ color: '#d4a03a' }}>${h.monto_calculado.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid #d4a03a' }}>
                      <td colSpan="4" className="p-2 text-right font-bold" style={{ color: '#d4a03a' }}>TOTAL PERÍODO:</td>
                      <td className="p-2 text-right text-lg font-bold" style={{ color: '#4cb07a' }}>${calcularTotalPeriodo()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* FORMULARIO FINAL */}
              <form onSubmit={handleRegistrarIngreso} className="mt-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <input 
                    type="date" 
                    value={formIngreso.fecha} 
                    onChange={(e) => setFormIngreso({ ...formIngreso, fecha: e.target.value })} 
                    className="p-2 rounded text-sm"
                    style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Concepto (ej: Servicios de vacío)" 
                    value={formIngreso.concepto} 
                    onChange={(e) => setFormIngreso({ ...formIngreso, concepto: e.target.value })} 
                    className="p-2 rounded text-sm"
                    style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
                  />
                  <select 
                    value={formIngreso.estado_cobro} 
                    onChange={(e) => setFormIngreso({ ...formIngreso, estado_cobro: e.target.value })} 
                    className="p-2 rounded text-sm"
                    style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="cobrado">Cobrado</option>
                    <option value="parcial">Parcial</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={guardando} 
                  className="w-full px-4 py-2 rounded font-bold text-white"
                  style={{ background: '#4cb07a', color: '#fff' }}
                >
                  {guardando ? 'Registrando...' : `✓ Registrar Ingreso $${calcularTotalPeriodo()}`}
                </button>
              </form>
            </div>
          )}

          {selectedCliente && horas.length === 0 && (
            <div className="p-3 rounded text-center" style={{ background: '#f07a3540', color: '#f07a35' }}>
              ⚠️ No hay horas registradas en este período para este cliente
            </div>
          )}
        </div>
      )}

      {/* HISTORIAL INGRESOS */}
      <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        <h2 className="text-lg font-bold mb-3" style={{ color: '#d4a03a' }}>Historial de Ingresos</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <p className="text-gray-400 text-sm">Los ingresos se registran desde la pestaña "Clientes" cuando completas las horas trabajadas</p>
        </div>
      </div>
    </div>
  )
}
