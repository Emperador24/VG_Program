import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function MaquinaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [maquina, setMaquina] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reasignando, setReasignando] = useState(false)
  const [operarios, setOperarios] = useState([])
  const [ubicaciones, setUbicaciones] = useState([])
  const [form, setForm] = useState({ operario_id: '', ubicacion_id: '', fecha_inicio: '' })
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  useEffect(() => {
    fetchMaquina()
    fetchOperarios()
    fetchUbicaciones()
  }, [id])

  const fetchMaquina = async () => {
    try {
      const res = await fetch(`${API_URL}/maquinas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMaquina(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOperarios = async () => {
    try {
      const res = await fetch(`${API_URL}/operarios`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOperarios(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUbicaciones = async () => {
    try {
      const res = await fetch(`${API_URL}/ubicaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUbicaciones(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const handleReasignar = async () => {
    if (!form.operario_id || !form.ubicacion_id || !form.fecha_inicio) {
      alert('Completa todos los campos')
      return
    }

    setReasignando(true)
    try {
      const res = await fetch(`${API_URL}/maquinas/${id}/reasignar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          operario_id: parseInt(form.operario_id),
          ubicacion_id: parseInt(form.ubicacion_id),
          fecha_inicio: form.fecha_inicio
        })
      })

      if (res.ok) {
        alert('Máquina reasignada')
        setForm({ operario_id: '', ubicacion_id: '', fecha_inicio: '' })
        fetchMaquina()
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setReasignando(false)
    }
  }

  if (loading) return <p className="text-gray-400">Cargando...</p>
  if (!maquina) return <p className="text-gray-400">No encontrada</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/maquinas')} className="text-gray-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>
          {maquina.codigo} - {maquina.tipo}
        </h1>
      </div>

      {/* INFO BÁSICA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Marca', value: maquina.marca },
          { label: 'Modelo', value: maquina.modelo },
          { label: 'Año', value: maquina.anio },
          { label: 'Estado', value: maquina.estado }
        ].map(item => (
          <div key={item.label} className="p-3 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="font-bold text-gray-200">{item.value}</p>
          </div>
        ))}
      </div>

      {/* ASIGNACIÓN ACTUAL */}
      {maquina.asignacionActual && (
        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <h2 className="text-lg font-bold mb-3" style={{ color: '#d4a03a' }}>Asignación Actual</h2>
          <p><strong>Operario:</strong> {maquina.asignacionActual.operario_nombre || 'Sin asignar'}</p>
          <p><strong>Ubicación:</strong> {maquina.asignacionActual.ubicacion_nombre || 'Sin ubicación'}</p>
          <p><strong>Desde:</strong> {maquina.asignacionActual.fecha_inicio}</p>
        </div>
      )}

      {/* REASIGNACIÓN */}
      {usuario.rol === 'administrador' && (
        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#d4a03a' }}>🔄 Reasignar</h2>
          <div className="grid grid-cols-3 gap-3">
            <select value={form.operario_id} onChange={(e) => setForm({ ...form, operario_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Operario</option>
              {operarios.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
            <select value={form.ubicacion_id} onChange={(e) => setForm({ ...form, ubicacion_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
              <option value="">Ubicación</option>
              {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
            <input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <button onClick={handleReasignar} disabled={reasignando} className="col-span-3 p-2 rounded font-bold text-white" style={{ background: '#d4a03a', color: '#0e0f11' }}>
              {reasignando ? 'Reasignando...' : 'Guardar Reasignación'}
            </button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Gastos Acumulados', value: `$${maquina.gastosAcumulados.toFixed(2)}`, color: '#d4a03a' },
          { label: 'Ingresos Acumulados', value: `$${maquina.ingresosAcumulados.toFixed(2)}`, color: '#5fa3b5' },
          { label: 'Ganancia', value: `$${maquina.gananciaAcumulada.toFixed(2)}`, color: maquina.gananciaAcumulada >= 0 ? '#4cb07a' : '#ef6b5e' },
          { label: 'Transactions', value: `${maquina.gastosQuantidad + maquina.ingresosQuantidad}`, color: '#a3aab3' }
        ].map(item => (
          <div key={item.label} className="p-3 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="font-bold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* HISTÓRICO ASIGNACIONES */}
      {maquina.historicoAsignaciones?.length > 0 && (
        <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <h2 className="text-lg font-bold mb-3" style={{ color: '#d4a03a' }}>Histórico de Asignaciones</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {maquina.historicoAsignaciones.map(a => (
              <div key={a.id} className="p-2 rounded text-sm" style={{ background: '#0e0f1140' }}>
                <p className="text-gray-200"><strong>{a.operario_nombre || 'Sin operario'}</strong> → {a.ubicacion_nombre || 'Sin ubicación'}</p>
                <p className="text-xs text-gray-400">{a.fecha_inicio} {a.fecha_fin ? `al ${a.fecha_fin}` : '(Vigente)'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
