import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Operarios() {
  const [operarios, setOperarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', cedula: '', cargo: '', monto_pago: '', rol: 'operario_principal' })
  const [editingId, setEditingId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchOperarios()
  }, [])

  const fetchOperarios = async () => {
    try {
      const res = await fetch(`${API_URL}/operarios`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setOperarios(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setOperarios([])
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.cedula || !form.monto_pago) {
      alert('Completa los campos requeridos: nombre, cédula, monto')
      return
    }

    setGuardando(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `${API_URL}/operarios/${editingId}` : `${API_URL}/operarios`

      const monto = parseFloat(form.monto_pago)
      if (isNaN(monto) || monto <= 0) {
        alert('El monto debe ser un número válido mayor a 0')
        setGuardando(false)
        return
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: form.nombre,
          cedula: form.cedula,
          cargo: form.cargo,
          monto_pago: monto,
          tipo_pago: 'diario',
          rol: form.rol
        })
      })

      const data = await res.json()

      if (res.ok) {
        setForm({ nombre: '', cedula: '', cargo: '', monto_pago: '', rol: 'operario_principal' })
        setEditingId(null)
        setShowForm(false)
        fetchOperarios()
        alert(editingId ? 'Operario actualizado' : 'Operario creado')
      } else {
        alert('Error: ' + (data.error || 'No se pudo guardar'))
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Eliminar operario ${nombre}?`)) {
      try {
        const res = await fetch(`${API_URL}/operarios/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          fetchOperarios()
          alert('Operario eliminado')
        } else {
          alert('Error al eliminar')
        }
      } catch (err) {
        alert('Error: ' + err.message)
      }
    }
  }

  const columns = [
    { key: 'nombre', label: 'NOMBRE' },
    { key: 'cedula', label: 'CÉDULA' },
    { key: 'cargo', label: 'CARGO' },
    { key: 'rol', label: 'TIPO OPERARIO', render: (val) => val === 'operario_principal' ? '👷 Principal' : '🤝 Ayudante' },
    { key: 'monto_pago', label: 'SALARIO DIARIO', render: (val) => `$${(parseFloat(val) || 0).toFixed(2)}` },
    {
      key: 'acciones',
      label: 'ACCIONES',
      render: (val, row) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditingId(row.id); setShowForm(true); setForm({ nombre: row.nombre, cedula: row.cedula, cargo: row.cargo, monto_pago: row.monto_pago, rol: row.rol }); }} className="px-2 py-1 rounded text-xs text-blue-400 hover:text-blue-200 border border-blue-400">
            ✏️ Editar
          </button>
          <button onClick={() => handleEliminar(row.id, row.nombre)} className="px-2 py-1 rounded text-xs text-red-400 hover:text-red-200 border border-red-400">
            🗑️ Eliminar
          </button>
        </div>
      )
    }
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold" style={{ color: '#d4a03a' }}>
              {editingId ? '✏️ Editar Operario' : '➕ Nuevo Operario'}
            </h2>
            <button type="button" onClick={() => { setEditingId(null); setShowForm(false); setForm({ nombre: '', cedula: '', cargo: '', monto_pago: '', tipo_pago: 'mensual' }); }} className="px-3 py-1 rounded text-sm text-gray-400 hover:text-white border border-gray-600">
              Cancelar
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input type="text" placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="text" placeholder="Cédula *" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="text" placeholder="Cargo" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="operario_principal">👷 Principal</option>
              <option value="ayudante">🤝 Ayudante</option>
            </select>
            <input type="number" placeholder="Salario Diario *" step="0.01" value={form.monto_pago} onChange={(e) => setForm({ ...form, monto_pago: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <button type="submit" disabled={guardando} className="col-span-2 md:col-span-1 px-4 py-2 rounded font-bold text-white" style={{ background: '#4cb07a', color: '#fff' }}>
              {guardando ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <GenericTable title="" columns={columns} data={operarios} loading={loading} />
    </div>
  )
}
