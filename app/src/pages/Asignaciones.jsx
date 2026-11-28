import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState([])
  const [maquinas, setMaquinas] = useState([])
  const [operarios, setOperarios] = useState([])
  const [ubicaciones, setUbicaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ maquina_id: '', operario_id: '', ubicacion_id: '' })
  const [guardando, setGuardando] = useState(false)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      await Promise.all([
        fetchAsignaciones(),
        fetchMaquinas(),
        fetchOperarios(),
        fetchUbicaciones()
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchAsignaciones = async () => {
    try {
      const res = await fetch(`${API_URL}/asignaciones`, { headers: { Authorization: `Bearer ${token}` } })
      setAsignaciones(Array.isArray(await res.json()) ? await res.json() : [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMaquinas = async () => {
    try {
      const res = await fetch(`${API_URL}/maquinas`, { headers: { Authorization: `Bearer ${token}` } })
      setMaquinas(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const fetchOperarios = async () => {
    try {
      const res = await fetch(`${API_URL}/operarios`, { headers: { Authorization: `Bearer ${token}` } })
      setOperarios(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUbicaciones = async () => {
    try {
      const res = await fetch(`${API_URL}/ubicaciones`, { headers: { Authorization: `Bearer ${token}` } })
      setUbicaciones(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  // Verificar si máquina ya está asignada
  const isMaquinaAsignada = (maquinaId) => {
    return asignaciones.some(a => a.maquina_id === parseInt(maquinaId) && !a.fecha_fin)
  }

  // Verificar si operario ya está asignado
  const isOperarioAsignado = (operarioId) => {
    return asignaciones.some(a => a.operario_id === parseInt(operarioId) && !a.fecha_fin)
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.maquina_id || !form.operario_id || !form.ubicacion_id) {
      alert('Completa todos los campos')
      return
    }

    if (isMaquinaAsignada(form.maquina_id)) {
      alert('Esta máquina ya está asignada')
      return
    }

    if (isOperarioAsignado(form.operario_id)) {
      alert('Este operario ya está asignado')
      return
    }

    setGuardando(true)
    try {
      const res = await fetch(`${API_URL}/asignaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          maquina_id: parseInt(form.maquina_id),
          operario_id: parseInt(form.operario_id),
          ubicacion_id: parseInt(form.ubicacion_id),
          fecha_inicio: new Date().toISOString().split('T')[0]
        })
      })

      if (res.ok) {
        setForm({ maquina_id: '', operario_id: '', ubicacion_id: '' })
        setShowForm(false)
        fetchAsignaciones()
        alert('Asignación creada')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleFinalizarAsignacion = async (id) => {
    if (!window.confirm('¿Finalizar esta asignación?')) return

    try {
      const res = await fetch(`${API_URL}/asignaciones/${id}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fecha_fin: new Date().toISOString().split('T')[0] })
      })

      if (res.ok) {
        fetchAsignaciones()
        alert('Asignación finalizada')
      } else {
        alert('Error al finalizar')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleCancelarAsignacion = async (id) => {
    if (!window.confirm('¿Cancelar esta asignación?')) return

    try {
      const res = await fetch(`${API_URL}/asignaciones/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        fetchAsignaciones()
        alert('Asignación cancelada')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) return <p className="text-gray-400">Cargando...</p>

  const asignacionesActivas = asignaciones.filter(a => !a.fecha_fin)
  const maquinasDisponibles = maquinas.filter(m => !isMaquinaAsignada(m.id))
  const operariosDisponibles = operarios.filter(o => !isOperarioAsignado(o.id))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>Asignaciones</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white" style={{ background: '#d4a03a', color: '#0e0f11' }}>
          <Plus size={16} /> Nueva Asignación
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleGuardar} className="p-4 rounded space-y-3" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <div className="grid grid-cols-3 gap-3">
            <select value={form.maquina_id} onChange={(e) => setForm({ ...form, maquina_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Máquina *</option>
              {maquinasDisponibles.map(m => (
                <option key={m.id} value={m.id}>{m.codigo} ({m.tipo})</option>
              ))}
            </select>
            <select value={form.operario_id} onChange={(e) => setForm({ ...form, operario_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Operario *</option>
              {operariosDisponibles.map(o => (
                <option key={o.id} value={o.id}>{o.nombre}</option>
              ))}
            </select>
            <select value={form.ubicacion_id} onChange={(e) => setForm({ ...form, ubicacion_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Ubicación *</option>
              {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
            <button type="submit" disabled={guardando} className="col-span-3 px-4 py-2 rounded font-bold text-white" style={{ background: '#4cb07a' }}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {/* TABLA ASIGNACIONES ACTIVAS */}
      <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        <h2 className="text-lg font-bold mb-3" style={{ color: '#d4a03a' }}>Asignaciones Activas ({asignacionesActivas.length})</h2>
        {asignacionesActivas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #2e3238' }}>
                  <th className="text-left p-2" style={{ color: '#d4a03a' }}>Máquina</th>
                  <th className="text-left p-2" style={{ color: '#d4a03a' }}>Operario</th>
                  <th className="text-left p-2" style={{ color: '#d4a03a' }}>Ubicación</th>
                  <th className="text-left p-2" style={{ color: '#d4a03a' }}>Desde</th>
                  <th className="text-center p-2" style={{ color: '#d4a03a' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {asignacionesActivas.map(a => {
                  const maq = maquinas.find(m => m.id === a.maquina_id)
                  const oper = operarios.find(o => o.id === a.operario_id)
                  const ubic = ubicaciones.find(u => u.id === a.ubicacion_id)
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid #2e3238' }}>
                      <td className="p-2 font-bold" style={{ color: '#d4a03a' }}>{maq?.codigo} ({maq?.tipo})</td>
                      <td className="p-2 text-gray-300">{oper?.nombre}</td>
                      <td className="p-2 text-gray-300">{ubic?.nombre}</td>
                      <td className="p-2 text-gray-300">{a.fecha_inicio}</td>
                      <td className="p-2 text-center space-x-2">
                        <button
                          onClick={() => handleFinalizarAsignacion(a.id)}
                          className="inline px-3 py-1 rounded text-xs text-white font-bold"
                          style={{ background: '#4cb07a' }}
                          title="Finalizar asignación"
                        >
                          ✓ Finalizar
                        </button>
                        <button
                          onClick={() => handleCancelarAsignacion(a.id)}
                          className="inline text-red-500 hover:text-red-400"
                          title="Cancelar asignación"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Sin asignaciones activas</p>
        )}
      </div>
    </div>
  )
}
