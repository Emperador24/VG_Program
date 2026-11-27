import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Trabajadores() {
  const [trabajadores, setTrabajadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', cedula: '', cargo: '', salario_diario: '' })
  const [guardando, setGuardando] = useState(false)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchTrabajadores()
  }, [])

  const fetchTrabajadores = async () => {
    try {
      const res = await fetch(`${API_URL}/trabajadores`, { headers: { Authorization: `Bearer ${token}` } })
      setTrabajadores(Array.isArray(await res.json()) ? await res.json() : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.cedula || !form.salario_diario) {
      alert('Completa los campos requeridos')
      return
    }

    setGuardando(true)
    try {
      const res = await fetch(`${API_URL}/trabajadores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, salario_diario: parseFloat(form.salario_diario) })
      })

      if (res.ok) {
        setForm({ nombre: '', cedula: '', cargo: '', salario_diario: '' })
        setShowForm(false)
        fetchTrabajadores()
        alert('Trabajador creado')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const columns = [
    { key: 'nombre', label: 'NOMBRE' },
    { key: 'cedula', label: 'CÉDULA' },
    { key: 'cargo', label: 'CARGO' },
    { key: 'salario_diario', label: 'SALARIO MENSUAL', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
    { key: 'activo', label: 'ESTADO', render: (val) => val ? '✓ Activo' : '✗ Inactivo' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>Trabajadores</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white" style={{ background: '#d4a03a', color: '#0e0f11' }}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleGuardar} className="p-4 rounded space-y-4" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input type="text" placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="text" placeholder="Cédula *" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="text" placeholder="Cargo" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="number" placeholder="Salario Mensual *" step="0.01" value={form.salario_diario} onChange={(e) => setForm({ ...form, salario_diario: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <button type="submit" disabled={guardando} className="col-span-2 md:col-span-1 px-4 py-2 rounded font-bold text-white" style={{ background: '#4cb07a', color: '#fff' }}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <GenericTable title="" columns={columns} data={trabajadores} loading={loading} />
    </div>
  )
}
