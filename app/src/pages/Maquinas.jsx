import { useState, useEffect } from 'react'
import { Plus, Edit2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Maquinas() {
  const navigate = useNavigate()
  const [maquinas, setMaquinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEstado, setEditingEstado] = useState(null)
  const [form, setForm] = useState({ codigo: '', tipo: 'vacuum', marca: '', modelo: '', anio: new Date().getFullYear(), estado: 'activo' })
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

      const data = await res.json()

      if (res.ok) {
        setForm({ codigo: '', tipo: 'vacuum', marca: '', modelo: '', anio: new Date().getFullYear(), estado: 'activo' })
        setShowForm(false)
        fetchMaquinas()
        alert('Máquina creada')
      } else {
        alert('Error: ' + (data.error || 'No se pudo guardar'))
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleCambiarEstado = async (maquinaId, nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/maquinas/${maquinaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      if (res.ok) {
        setEditingEstado(null)
        fetchMaquinas()
        alert('Estado actualizado')
      } else {
        alert('Error al actualizar estado')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo':
        return '#4cb07a'
      case 'taller':
        return '#f07a35'
      case 'parada':
        return '#ef6b5e'
      default:
        return '#a3aab3'
    }
  }

  if (loading) return <p className="text-gray-400">Cargando...</p>

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
            <input type="text" placeholder="Código/Placa *" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Tipo *</option>
              <option value="vacuum">Vacuum</option>
              <option value="solador">Solador</option>
              <option value="batea">Batea</option>
              <option value="lowboy">Lowboy</option>
              <option value="camion">Camión</option>
              <option value="transporte">Transporte</option>
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

      {/* TABLA DE MÁQUINAS */}
      <div className="p-4 rounded overflow-x-auto" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        {maquinas.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #2e3238' }}>
                <th className="text-left p-2" style={{ color: '#d4a03a' }}>CÓDIGO</th>
                <th className="text-left p-2" style={{ color: '#d4a03a' }}>TIPO</th>
                <th className="text-left p-2" style={{ color: '#d4a03a' }}>MARCA</th>
                <th className="text-left p-2" style={{ color: '#d4a03a' }}>MODELO</th>
                <th className="text-left p-2" style={{ color: '#d4a03a' }}>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {maquinas.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #2e3238' }}>
                  <td className="p-2 text-gray-300 font-bold cursor-pointer" onClick={() => navigate(`/maquinas/${m.id}`)}>
                    {m.codigo}
                  </td>
                  <td className="p-2 text-gray-300">{m.tipo}</td>
                  <td className="p-2 text-gray-300">{m.marca}</td>
                  <td className="p-2 text-gray-300">{m.modelo || '-'}</td>
                  <td className="p-2">
                    {editingEstado === m.id ? (
                      <select
                        value={m.estado}
                        onChange={(e) => handleCambiarEstado(m.id, e.target.value)}
                        className="p-1 rounded text-xs"
                        style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #d4a03a' }}
                      >
                        <option value="activo">Activo</option>
                        <option value="taller">Taller</option>
                        <option value="parada">Parada</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-1 rounded text-xs font-bold text-white"
                          style={{ background: getEstadoColor(m.estado) }}
                        >
                          {m.estado.toUpperCase()}
                        </span>
                        <button
                          onClick={() => setEditingEstado(m.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-sm p-4">Sin máquinas registradas</p>
        )}
      </div>
    </div>
  )
}
