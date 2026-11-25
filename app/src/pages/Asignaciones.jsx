import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState([])
  const [maquinas, setMaquinas] = useState([])
  const [operarios, setOperarios] = useState([])
  const [ubicaciones, setUbicaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ maquina_id: '', operario_id: '', ubicacion_id: '', fecha_inicio: new Date().toISOString().split('T')[0] })
  const [guardando, setGuardando] = useState(false)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchAsignaciones()
    fetchMaquinas()
    fetchOperarios()
    fetchUbicaciones()
  }, [])

  const fetchAsignaciones = async () => {
    try {
      const res = await fetch(`${API_URL}/asignaciones`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setAsignaciones(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
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

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.maquina_id || !form.operario_id || !form.ubicacion_id || !form.fecha_inicio) {
      alert('Completa todos los campos')
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
          fecha_inicio: form.fecha_inicio
        })
      })

      if (res.ok) {
        setForm({ maquina_id: '', operario_id: '', ubicacion_id: '', fecha_inicio: new Date().toISOString().split('T')[0] })
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

  const columns = [
    { key: 'maquina_id', label: 'MÁQUINA', render: (val) => `Máquina ${val}` },
    { key: 'operario_id', label: 'OPERARIO', render: (val) => `Operario ${val}` },
    { key: 'fecha_inicio', label: 'INICIO' },
    { key: 'fecha_fin', label: 'FIN', render: (val) => val || '-' },
  ]

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={form.maquina_id} onChange={(e) => setForm({ ...form, maquina_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Máquina *</option>
              {maquinas.map(m => <option key={m.id} value={m.id}>{m.placa}</option>)}
            </select>
            <select value={form.operario_id} onChange={(e) => setForm({ ...form, operario_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Operario *</option>
              {operarios.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
            <select value={form.ubicacion_id} onChange={(e) => setForm({ ...form, ubicacion_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Ubicación *</option>
              {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
            <input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <button type="submit" disabled={guardando} className="col-span-2 md:col-span-1 px-4 py-2 rounded font-bold text-white" style={{ background: '#4cb07a' }}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <GenericTable title="" columns={columns} data={asignaciones} loading={loading} />
    </div>
  )
}
