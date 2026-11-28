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
  const [editingMaquina, setEditingMaquina] = useState(null)
  const [form, setForm] = useState({ codigo: '', tipo: 'vacuum', marca: '', modelo: '', anio: new Date().getFullYear(), estado: 'activo', chuto_maquina_id: '', camion_tipo: '' })
  const [guardando, setGuardando] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState([])
  const [filtroTipo, setFiltroTipo] = useState([])
  const token = localStorage.getItem('token')

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

  const tiposDisponibles = [...new Set(maquinas.map(m => m.tipo))]
  const estadosDisponibles = ['activo', 'taller', 'parada']

  const maquinasFiltradas = maquinas.filter(m => {
    const cumpleFiltroEstado = filtroEstado.length === 0 || filtroEstado.includes(m.estado)
    const cumpleFiltroTipo = filtroTipo.length === 0 || filtroTipo.includes(m.tipo)
    return cumpleFiltroEstado && cumpleFiltroTipo
  })

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

  const handleEditar = (maquina) => {
    setEditingMaquina(maquina.id)
    setForm({
      codigo: maquina.codigo,
      tipo: maquina.tipo,
      marca: maquina.marca,
      modelo: maquina.modelo || '',
      anio: maquina.anio || new Date().getFullYear(),
      estado: maquina.estado,
      chuto_maquina_id: maquina.chuto_maquina_id || '',
      camion_tipo: maquina.camion_tipo || ''
    })
    setShowForm(true)
  }

  const handleCancelar = () => {
    setEditingMaquina(null)
    setShowForm(false)
    setForm({ codigo: '', tipo: 'vacuum', marca: '', modelo: '', anio: new Date().getFullYear(), estado: 'activo', chuto_maquina_id: '', camion_tipo: '' })
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.codigo || !form.tipo || !form.marca) {
      alert('Completa los campos requeridos')
      return
    }

    if (form.tipo === 'camion' && !form.camion_tipo) {
      alert('Si es Camión, debes especificar si es Diario o Soldador')
      return
    }

    if (form.tipo === 'chuto' && !form.chuto_maquina_id) {
      alert('Si es Chuto, debes seleccionar qué máquina lleva (Batea, Vacuum o Lowboy)')
      return
    }

    setGuardando(true)
    try {
      const method = editingMaquina ? 'PUT' : 'POST'
      const url = editingMaquina ? `${API_URL}/maquinas/${editingMaquina}` : `${API_URL}/maquinas`

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, anio: parseInt(form.anio) })
      })

      const data = await res.json()

      if (res.ok) {
        setForm({ codigo: '', tipo: 'vacuum', marca: '', modelo: '', anio: new Date().getFullYear(), estado: 'activo', chuto_maquina_id: '', camion_tipo: '' })
        setEditingMaquina(null)
        setShowForm(false)
        fetchMaquinas()
        alert(editingMaquina ? 'Máquina actualizada' : 'Máquina creada')
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

      {/* FILTROS */}
      <div className="p-4 rounded space-y-3" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        <div>
          <label className="text-xs font-bold" style={{ color: '#d4a03a' }}>FILTRAR POR ESTADO:</label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {estadosDisponibles.map(est => (
              <button
                key={est}
                onClick={() => setFiltroEstado(filtroEstado.includes(est) ? filtroEstado.filter(f => f !== est) : [...filtroEstado, est])}
                className="px-3 py-1 rounded text-xs font-bold transition-all"
                style={{
                  background: filtroEstado.includes(est) ? getEstadoColor(est) : '#2e3238',
                  color: filtroEstado.includes(est) ? '#fff' : '#a3aab3',
                  border: `1px solid ${filtroEstado.includes(est) ? getEstadoColor(est) : '#2e3238'}`
                }}
              >
                {capitalize(est)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold" style={{ color: '#d4a03a' }}>FILTRAR POR TIPO:</label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {tiposDisponibles.sort().map(tipo => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(filtroTipo.includes(tipo) ? filtroTipo.filter(f => f !== tipo) : [...filtroTipo, tipo])}
                className="px-3 py-1 rounded text-xs font-bold transition-all"
                style={{
                  background: filtroTipo.includes(tipo) ? '#d4a03a' : '#2e3238',
                  color: filtroTipo.includes(tipo) ? '#0e0f11' : '#a3aab3',
                  border: `1px solid ${filtroTipo.includes(tipo) ? '#d4a03a' : '#2e3238'}`
                }}
              >
                {capitalize(tipo)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleGuardar} className="p-4 rounded space-y-4" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold" style={{ color: '#d4a03a' }}>
              {editingMaquina ? '✏️ Editar Máquina' : '➕ Nueva Máquina'}
            </h2>
            <button type="button" onClick={handleCancelar} className="px-3 py-1 rounded text-sm text-gray-400 hover:text-white border border-gray-600">
              Cancelar
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input type="text" placeholder="Código/Placa *" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value, chuto_tipo: '', camion_tipo: '' })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Tipo *</option>
              <option value="vacuum">Vacuum</option>
              <option value="batea">Batea</option>
              <option value="lowboy">Lowboy</option>
              <option value="camion">Camión</option>
              <option value="transporte">Transporte</option>
              <option value="chuto">Chuto</option>
            </select>
            {form.tipo === 'camion' && (
              <select value={form.camion_tipo} onChange={(e) => setForm({ ...form, camion_tipo: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #d4a03a' }}>
                <option value="">Camión es... *</option>
                <option value="diario">Diario</option>
                <option value="soldador">Soldador</option>
              </select>
            )}
            {form.tipo === 'chuto' && (
              <select value={form.chuto_maquina_id} onChange={(e) => setForm({ ...form, chuto_maquina_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #d4a03a' }}>
                <option value="">Selecciona máquina... *</option>
                {maquinas.filter(m => {
                  // Solo mostrar máquinas de tipo batea, vacuum, lowboy
                  if (!['batea', 'vacuum', 'lowboy'].includes(m.tipo)) return false
                  // Excluir máquinas que ya están en OTRO chuto
                  const estaEnOtroChuto = maquinas.some(chuto =>
                    chuto.tipo === 'chuto' &&
                    chuto.chuto_maquina_id === m.id &&
                    chuto.id !== editingMaquina
                  )
                  return !estaEnOtroChuto
                }).map(m => (
                  <option key={m.id} value={m.id}>{m.codigo} ({capitalize(m.tipo)})</option>
                ))}
              </select>
            )}
            <input type="text" placeholder="Marca *" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="text" placeholder="Modelo" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="number" placeholder="Año" value={form.anio} onChange={(e) => setForm({ ...form, anio: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <button type="submit" disabled={guardando} className="col-span-2 md:col-span-1 px-4 py-2 rounded font-bold text-white" style={{ background: '#4cb07a', color: '#fff' }}>
              {guardando ? 'Guardando...' : editingMaquina ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {/* TABLA DE MÁQUINAS */}
      <div className="p-4 rounded overflow-x-auto" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        <div className="text-xs mb-2" style={{ color: '#a3aab3' }}>Mostrando {maquinasFiltradas.length} de {maquinas.length} máquinas</div>
        {maquinasFiltradas.length > 0 ? (
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
              {maquinasFiltradas.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #2e3238' }}>
                  <td className="p-2 text-gray-300 font-bold cursor-pointer" onClick={() => navigate(`/maquinas/${m.id}`)}>
                    {capitalize(m.codigo)}
                  </td>
                  <td className="p-2 text-gray-300">
                    {m.tipo === 'camion' ? `Camión (${capitalize(m.camion_tipo)})` : m.tipo === 'chuto' ? `Chuto (${m.chuto_maquina_id ? maquinas.find(x => x.id === m.chuto_maquina_id)?.codigo || 'N/A' : 'vacío'})` : capitalize(m.tipo)}
                  </td>
                  <td className="p-2 text-gray-300">{capitalize(m.marca)}</td>
                  <td className="p-2 text-gray-300">{m.modelo ? capitalize(m.modelo) : '-'}</td>
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
                          {capitalize(m.estado)}
                        </span>
                        <button
                          onClick={() => setEditingEstado(m.id)}
                          className="text-gray-400 hover:text-white"
                          title="Cambiar estado"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleEditar(m)}
                          className="text-gray-400 hover:text-white"
                          title="Editar máquina"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-sm p-4">{maquinas.length === 0 ? 'Sin máquinas registradas' : 'Sin máquinas que coincidan con los filtros'}</p>
        )}
      </div>
    </div>
  )
}
