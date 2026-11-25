import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Ingresos() {
  const [ingresos, setIngresos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [clientes, setClientes] = useState([])
  const [maquinas, setMaquinas] = useState([])
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], cliente_id: '', maquina_id: '', concepto: '', monto_usd: '', estado_cobro: 'pendiente' })
  const [guardando, setGuardando] = useState(false)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchIngresos()
    fetchClientes()
    fetchMaquinas()
  }, [])

  const fetchIngresos = async () => {
    try {
      const res = await fetch(`${API_URL}/ingresos`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setIngresos(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } })
      setClientes(await res.json())
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

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.cliente_id || !form.maquina_id || !form.monto_usd) {
      alert('Completa los campos requeridos')
      return
    }

    setGuardando(true)
    try {
      const res = await fetch(`${API_URL}/ingresos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, cliente_id: parseInt(form.cliente_id), maquina_id: parseInt(form.maquina_id), monto_usd: parseFloat(form.monto_usd) })
      })

      if (res.ok) {
        setForm({ fecha: new Date().toISOString().split('T')[0], cliente_id: '', maquina_id: '', concepto: '', monto_usd: '', estado_cobro: 'pendiente' })
        setShowForm(false)
        fetchIngresos()
        alert('Ingreso registrado')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const columns = [
    { key: 'fecha', label: 'FECHA' },
    { key: 'concepto', label: 'CONCEPTO' },
    { key: 'monto_usd', label: 'MONTO', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
    { key: 'estado_cobro', label: 'ESTADO' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>Ingresos</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white" style={{ background: '#d4a03a', color: '#0e0f11' }}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleGuardar} className="p-4 rounded space-y-4" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Cliente *</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <select value={form.maquina_id} onChange={(e) => setForm({ ...form, maquina_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Máquina *</option>
              {maquinas.map(m => <option key={m.id} value={m.id}>{m.codigo}</option>)}
            </select>
            <input type="text" placeholder="Concepto" value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="number" placeholder="Monto USD *" value={form.monto_usd} onChange={(e) => setForm({ ...form, monto_usd: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <button type="submit" disabled={guardando} className="col-span-2 md:col-span-1 px-4 py-2 rounded font-bold text-white" style={{ background: '#4cb07a', color: '#fff' }}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <GenericTable title="" columns={columns} data={ingresos} loading={loading} />
    </div>
  )
}
