import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Maquinas() {
  const navigate = useNavigate()
  const [maquinas, setMaquinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ codigo: '', tipo: '', marca: '', modelo: '', anio: new Date().getFullYear(), estado: 'activo' })
  const [guardando, setGuardando] = useState(false)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchMaquinas()
  }, [])

  const fetchMaquinas = async () => {
    try {
      const res = await fetch(`${API_URL}/maquinas`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setMaquinas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.codigo || !form.tipo || !form.marca) {
      alert('Completa los campos requeridos')
      return
    }

    setGuardando(true)
    try {
      const res = await fetch(`${API_URL}/maquinas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, anio: parseInt(form.anio) })
      })

      if (res.ok) {
        setForm({ codigo: '', tipo: '', marca: '', modelo: '', anio: new Date().getFullYear(), estado: 'activo' })
        setShowForm(false)
        fetchMaquinas()
        alert('Máquina creada')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const columns = [
    { key: 'codigo', label: 'CÓDIGO' },
    { key: 'tipo', label: 'TIPO' },
    { key: 'marca', label: 'MARCA' },
    { key: 'modelo', label: 'MODELO' },
    { key: 'estado', label: 'ESTADO' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>Máquinas</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white" style={{ background: '#d4a03a', color: '#0e0f11' }}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleGuardar} className="p-4 rounded space-y-4" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input type="text" placeholder="Código *" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Tipo *</option>
              <option value="vacuum">Vacuum</option>
              <option value="solador">Solador</option>
              <option value="batea">Batea</option>
              <option value="lowboy">Lowboy</option>
              <option value="camion">Camión</option>
            </select>
            <input type="text" placeholder="Marca *" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="text" placeholder="Modelo" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="number" placeholder="Año" value={form.anio} onChange={(e) => setForm({ ...form, anio: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <button type="submit" disabled={guardando} className="col-span-2 md:col-span-1 px-4 py-2 rounded font-bold text-white" style={{ background: '#4cb07a', color: '#fff' }}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <GenericTable 
        title="" 
        columns={columns} 
        data={maquinas.map(m => ({ ...m, _id: m.id }))} 
        loading={loading} 
      />
    </div>
  )
}
