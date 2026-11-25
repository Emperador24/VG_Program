import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Ubicaciones() {
  const [ubicaciones, setUbicaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', estado_municipio: '' })
  const [guardando, setGuardando] = useState(false)
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch(`${API_URL}/ubicaciones`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setUbicaciones(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.nombre) {
      alert('El nombre es requerido')
      return
    }

    setGuardando(true)
    try {
      const res = await fetch(`${API_URL}/ubicaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        setForm({ nombre: '', estado_municipio: '' })
        setShowForm(false)
        const res2 = await fetch(`${API_URL}/ubicaciones`, { headers: { Authorization: `Bearer ${token}` } })
        setUbicaciones(await res2.json())
        alert('Ubicación creada')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const columns = [
    { key: 'nombre', label: 'UBICACIÓN' },
    { key: 'estado_municipio', label: 'MUNICIPIO' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>Ubicaciones</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white" style={{ background: '#d4a03a', color: '#0e0f11' }}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleGuardar} className="p-4 rounded space-y-4" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="text" placeholder="Municipio" value={form.estado_municipio} onChange={(e) => setForm({ ...form, estado_municipio: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <button type="submit" disabled={guardando} className="col-span-2 px-4 py-2 rounded font-bold text-white" style={{ background: '#4cb07a', color: '#fff' }}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <GenericTable title="" columns={columns} data={ubicaciones} loading={loading} />
    </div>
  )
}
