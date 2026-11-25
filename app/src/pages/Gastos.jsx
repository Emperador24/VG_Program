import { useState, useEffect } from 'react'
import { Trash2, Check, X, Plus } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Gastos() {
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterEstado, setFilterEstado] = useState('todos')
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    maquina_id: '',
    operario_id: '',
    ubicacion_id: '',
    categoria_id: '',
    monto_usd: '',
    descripcion: '',
  })

  useEffect(() => {
    fetchGastos()
  }, [filterEstado])

  const fetchGastos = async () => {
    setLoading(true)
    try {
      const url = filterEstado === 'todos' 
        ? `${API_URL}/gastos`
        : `${API_URL}/gastos?estado=${filterEstado}`
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setGastos(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrar = async (e) => {
    e.preventDefault()
    if (!formData.monto_usd || !formData.categoria_id) {
      alert('Llena los campos requeridos')
      return
    }

    try {
      const res = await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          monto_usd: parseFloat(formData.monto_usd),
          estado: 'pendiente',
          creado_por: usuario.id
        })
      })

      if (res.ok) {
        setFormData({
          fecha: new Date().toISOString().split('T')[0],
          maquina_id: '',
          operario_id: '',
          ubicacion_id: '',
          categoria_id: '',
          monto_usd: '',
          descripcion: '',
        })
        setShowForm(false)
        fetchGastos()
        alert('Gasto registrado')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleAprobar = async (id) => {
    try {
      const res = await fetch(`${API_URL}/gastos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'aprobado' })
      })

      if (res.ok) {
        fetchGastos()
        alert('Gasto aprobado')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleRechazar = async (id) => {
    try {
      const res = await fetch(`${API_URL}/gastos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'anulado' })
      })

      if (res.ok) {
        fetchGastos()
        alert('Gasto rechazado')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado':
        return '#4cb07a'
      case 'pendiente':
        return '#f07a35'
      case 'anulado':
        return '#ef6b5e'
      default:
        return '#a3aab3'
    }
  }

  const gastosFiltrados = gastos.filter(g => 
    filterEstado === 'todos' || g.estado === filterEstado
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>
          Gastos
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white transition-all"
          style={{ background: '#d4a03a', color: '#0e0f11' }}
          onMouseEnter={(e) => (e.target.style.background = '#c89c2f')}
          onMouseLeave={(e) => (e.target.style.background = '#d4a03a')}
        >
          <Plus size={16} />
          Registrar Gasto
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#d4a03a' }}>
            Nuevo Gasto
          </h2>
          <form onSubmit={handleRegistrar} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="p-2 rounded text-sm"
              style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
            />
            <input
              type="number"
              placeholder="Monto USD *"
              value={formData.monto_usd}
              onChange={(e) => setFormData({ ...formData, monto_usd: e.target.value })}
              className="p-2 rounded text-sm"
              style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
              required
            />
            <select
              value={formData.categoria_id}
              onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
              className="p-2 rounded text-sm"
              style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
              required
            >
              <option value="">Categoría *</option>
              <option value="1">Combustible</option>
              <option value="2">Aceite y lubricantes</option>
              <option value="3">Repuestos</option>
              <option value="4">Mantenimiento</option>
              <option value="5">Cauchos</option>
            </select>
            <input
              type="text"
              placeholder="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="p-2 rounded text-sm col-span-2 md:col-span-1"
              style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
            />
            <button
              type="submit"
              className="col-span-2 md:col-span-1 px-4 py-2 rounded text-sm font-bold text-white"
              style={{ background: '#4cb07a' }}
            >
              Guardar
            </button>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
        {['todos', 'pendiente', 'aprobado', 'anulado'].map((estado) => (
          <button
            key={estado}
            onClick={() => setFilterEstado(estado)}
            className="px-3 py-2 rounded text-sm font-semibold transition-all"
            style={{
              background: filterEstado === estado ? '#d4a03a' : '#181a1e',
              color: filterEstado === estado ? '#0e0f11' : '#a3aab3',
              border: '1px solid #2e3238'
            }}
          >
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
            {' '}
            ({gastos.filter(g => g.estado === estado).length})
          </button>
        ))}
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : gastosFiltrados.length === 0 ? (
        <p className="text-gray-400">Sin gastos</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #2e3238' }}>
                <th className="text-left p-3" style={{ color: '#d4a03a' }}>
                  FECHA
                </th>
                <th className="text-left p-3" style={{ color: '#d4a03a' }}>
                  CATEGORÍA
                </th>
                <th className="text-right p-3" style={{ color: '#d4a03a' }}>
                  MONTO
                </th>
                <th className="text-left p-3" style={{ color: '#d4a03a' }}>
                  ESTADO
                </th>
                {usuario.rol === 'administrador' && (
                  <th className="text-center p-3" style={{ color: '#d4a03a' }}>
                    ACCIONES
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {gastosFiltrados.map((gasto) => (
                <tr key={gasto.id} style={{ borderBottom: '1px solid #2e3238' }}>
                  <td className="p-3 text-gray-300">{gasto.fecha}</td>
                  <td className="p-3 text-gray-300">{gasto.categoria || 'N/A'}</td>
                  <td className="p-3 text-right font-bold" style={{ color: '#d4a03a' }}>
                    ${gasto.monto_usd.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{
                        background: getEstadoColor(gasto.estado) + '30',
                        color: getEstadoColor(gasto.estado)
                      }}
                    >
                      {gasto.estado.charAt(0).toUpperCase() + gasto.estado.slice(1)}
                    </span>
                  </td>
                  {usuario.rol === 'administrador' && (
                    <td className="p-3 text-center space-x-2">
                      {gasto.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleAprobar(gasto.id)}
                            className="inline text-green-500 hover:text-green-400"
                            title="Aprobar"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleRechazar(gasto.id)}
                            className="inline text-red-500 hover:text-red-400"
                            title="Rechazar"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
