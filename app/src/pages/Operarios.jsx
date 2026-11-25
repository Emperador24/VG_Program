import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Operarios() {
  const [operarios, setOperarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', cedula: '', cargo: '', monto_pago: '', salario_diario: '', rol: 'operario_principal', tipo_pago: 'mensual' })
  const [guardando, setGuardando] = useState(false)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchOperarios()
  }, [])

  const fetchOperarios = async () => {
    try {
      const res = await fetch(`${API_URL}/operarios`, { headers: { Authorization: `Bearer ${token}` } })
      setOperarios(Array.isArray(await res.json()) ? await res.json() : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.cedula) {
      alert('Completa los campos requeridos')
      return
    }

    setGuardando(true)
    try {
      const res = await fetch(`${API_URL}/operarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          ...form, 
          monto_pago: form.monto_pago ? parseFloat(form.monto_pago) : 0,
          salario_diario: form.salario_diario ? parseFloat(form.salario_diario) : 0
        })
      })

      if (res.ok) {
        setForm({ nombre: '', cedula: '', cargo: '', monto_pago: '', salario_diario: '', rol: 'operario_principal', tipo_pago: 'mensual' })
        setShowForm(false)
        fetchOperarios()
        alert('Operario creado')
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
    { key: 'rol', label: 'ROL', render: (val) => val === 'operario_principal' ? '👷 Principal' : '🤝 Ayudante' },
    { key: 'salario_diario', label: 'DIARIO', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
    { key: 'monto_pago', label: 'MENSUAL', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
    { key: 'activo', label: 'ESTADO', render: (val) => val ? '✓ Activo' : '✗ Inactivo' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>Operarios</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white" style={{ background: '#d4a03a', color: '#0e0f11' }}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleGuardar} className="p-4 rounded space-y-4" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input type="text" placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="text" placeholder="Cédula *" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="text" placeholder="Cargo" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="operario_principal">👷 Principal</option>
              <option value="ayudante">🤝 Ayudante</option>
            </select>
            <input type="number" placeholder="Salario Diario" value={form.salario_diario} onChange={(e) => setForm({ ...form, salario_diario: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="number" placeholder="Monto Mensual" value={form.monto_pago} onChange={(e) => setForm({ ...form, monto_pago: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <select value={form.tipo_pago} onChange={(e) => setForm({ ...form, tipo_pago: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
            <button type="submit" disabled={guardando} className="col-span-2 md:col-span-1 px-4 py-2 rounded font-bold text-white" style={{ background: '#4cb07a', color: '#fff' }}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <GenericTable title="" columns={columns} data={operarios} loading={loading} />
    </div>
  )
}
