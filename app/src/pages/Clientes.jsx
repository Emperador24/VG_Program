import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [maquinas, setMaquinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFormCliente, setShowFormCliente] = useState(false)
  const [showFormContrato, setShowFormContrato] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [contratos, setContratos] = useState([])
  const [horas, setHoras] = useState([])
  
  const token = localStorage.getItem('token')

  const [formCliente, setFormCliente] = useState({ nombre: '', rif: '', contacto: '' })
  const [formContrato, setFormContrato] = useState({ maquina_id: '', monto_hora_dia: '', monto_hora_noche: '', fecha_inicio: new Date().toISOString().split('T')[0], fecha_fin: '' })
  const [formHoras, setFormHoras] = useState({ fecha: new Date().toISOString().split('T')[0], horas: '', es_noche: false })

  useEffect(() => {
    fetchClientes()
    fetchMaquinas()
  }, [])

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } })
      setClientes(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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

  const handleClienteSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formCliente)
      })
      if (res.ok) {
        setFormCliente({ nombre: '', rif: '', contacto: '' })
        setShowFormCliente(false)
        fetchClientes()
        alert('Cliente creado')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleContratoSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/clientes-contratos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          cliente_id: selectedCliente,
          maquina_id: parseInt(formContrato.maquina_id),
          monto_hora_dia: parseFloat(formContrato.monto_hora_dia),
          monto_hora_noche: parseFloat(formContrato.monto_hora_noche),
          fecha_inicio: formContrato.fecha_inicio,
          fecha_fin: formContrato.fecha_fin || null
        })
      })
      if (res.ok) {
        fetchContratos(selectedCliente)
        setFormContrato({ maquina_id: '', monto_hora_dia: '', monto_hora_noche: '', fecha_inicio: new Date().toISOString().split('T')[0], fecha_fin: '' })
        setShowFormContrato(false)
        alert('Contrato creado')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleHorasSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCliente || contratos.length === 0) {
      alert('Selecciona cliente y máquina')
      return
    }
    try {
      const res = await fetch(`${API_URL}/clientes-contratos/horas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          cliente_contrato_id: contratos[0].id,
          fecha: formHoras.fecha,
          horas: parseFloat(formHoras.horas),
          es_noche: formHoras.es_noche
        })
      })
      if (res.ok) {
        fetchHoras(selectedCliente)
        setFormHoras({ fecha: new Date().toISOString().split('T')[0], horas: '', es_noche: false })
        alert('Horas registradas')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const fetchContratos = async (cliente_id) => {
    try {
      const res = await fetch(`${API_URL}/clientes-contratos/cliente/${cliente_id}`, { headers: { Authorization: `Bearer ${token}` } })
      setContratos(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const fetchHoras = async (cliente_id) => {
    const hoy = new Date()
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
    const fin = new Date().toISOString().split('T')[0]
    try {
      const res = await fetch(`${API_URL}/clientes-contratos/horas/${cliente_id}/${inicio}/${fin}`, { headers: { Authorization: `Bearer ${token}` } })
      setHoras(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const selectCliente = (id) => {
    setSelectedCliente(id)
    fetchContratos(id)
    fetchHoras(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>Clientes</h1>
        <button onClick={() => setShowFormCliente(!showFormCliente)} className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white" style={{ background: '#d4a03a', color: '#0e0f11' }}>
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      {showFormCliente && (
        <form onSubmit={handleClienteSubmit} className="p-4 rounded space-y-3" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" placeholder="Nombre *" value={formCliente.nombre} onChange={(e) => setFormCliente({ ...formCliente, nombre: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="text" placeholder="RIF" value={formCliente.rif} onChange={(e) => setFormCliente({ ...formCliente, rif: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <input type="text" placeholder="Contacto" value={formCliente.contacto} onChange={(e) => setFormCliente({ ...formCliente, contacto: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
            <button type="submit" className="col-span-3 px-4 py-2 rounded font-bold text-white" style={{ background: '#4cb07a' }}>Guardar</button>
          </div>
        </form>
      )}

      {/* GRID CLIENTES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
        {clientes.map(c => (
          <button
            key={c.id}
            onClick={() => selectCliente(c.id)}
            className="p-3 rounded text-left transition-all"
            style={{
              background: selectedCliente === c.id ? '#d4a03a40' : '#181a1e',
              border: `1px solid ${selectedCliente === c.id ? '#d4a03a' : '#2e3238'}`,
              color: selectedCliente === c.id ? '#d4a03a' : '#a3aab3'
            }}
          >
            <p className="font-bold">{c.nombre}</p>
            <p className="text-xs">{c.rif}</p>
          </button>
        ))}
      </div>

      {selectedCliente && (
        <>
          {/* CONTRATOS */}
          <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold" style={{ color: '#d4a03a' }}>Máquinas del Contrato</h2>
              <button onClick={() => setShowFormContrato(!showFormContrato)} className="text-sm px-3 py-1 rounded" style={{ background: '#d4a03a', color: '#0e0f11' }}>
                + Agregar
              </button>
            </div>

            {showFormContrato && (
              <form onSubmit={handleContratoSubmit} className="mb-4 p-3 rounded" style={{ background: '#0e0f1140' }}>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  <select value={formContrato.maquina_id} onChange={(e) => setFormContrato({ ...formContrato, maquina_id: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}>
                    <option value="">Máquina *</option>
                    {maquinas.map(m => <option key={m.id} value={m.id}>{m.placa}</option>)}
                  </select>
                  <input type="number" placeholder="$ Día" step="0.01" value={formContrato.monto_hora_dia} onChange={(e) => setFormContrato({ ...formContrato, monto_hora_dia: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
                  <input type="number" placeholder="$ Noche" step="0.01" value={formContrato.monto_hora_noche} onChange={(e) => setFormContrato({ ...formContrato, monto_hora_noche: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
                  <input type="date" value={formContrato.fecha_inicio} onChange={(e) => setFormContrato({ ...formContrato, fecha_inicio: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
                  <button type="submit" className="px-3 py-2 rounded font-bold text-sm text-white" style={{ background: '#4cb07a' }}>✓</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {contratos.length > 0 ? (
                contratos.map(c => (
                  <div key={c.id} className="p-2 rounded flex justify-between text-sm" style={{ background: '#0e0f1140' }}>
                    <span><strong>{c.placa}</strong> ({c.tipo})</span>
                    <span style={{ color: '#d4a03a' }}>${c.monto_hora_dia} día / ${c.monto_hora_noche} noche</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Sin máquinas asignadas</p>
              )}
            </div>
          </div>

          {/* REGISTRAR HORAS */}
          {contratos.length > 0 && (
            <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
              <h2 className="text-lg font-bold mb-3" style={{ color: '#d4a03a' }}>Registrar Horas Trabajadas</h2>
              <form onSubmit={handleHorasSubmit} className="grid grid-cols-4 gap-3 mb-4">
                <input type="date" value={formHoras.fecha} onChange={(e) => setFormHoras({ ...formHoras, fecha: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
                <input type="number" placeholder="Horas" step="0.5" value={formHoras.horas} onChange={(e) => setFormHoras({ ...formHoras, horas: e.target.value })} className="p-2 rounded text-sm" style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }} />
                <label className="flex items-center gap-2 text-sm" style={{ color: '#a3aab3' }}>
                  <input type="checkbox" checked={formHoras.es_noche} onChange={(e) => setFormHoras({ ...formHoras, es_noche: e.target.checked })} />
                  Noche 🌙
                </label>
                <button type="submit" className="px-4 py-2 rounded font-bold text-white" style={{ background: '#4cb07a' }}>Guardar</button>
              </form>

              {/* TABLA HORAS DEL MES */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2e3238' }}>
                      <th className="text-left p-2" style={{ color: '#d4a03a' }}>Fecha</th>
                      <th className="text-left p-2" style={{ color: '#d4a03a' }}>Máquina</th>
                      <th className="text-center p-2" style={{ color: '#d4a03a' }}>Horas</th>
                      <th className="text-center p-2" style={{ color: '#d4a03a' }}>Tipo</th>
                      <th className="text-right p-2" style={{ color: '#d4a03a' }}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horas.map(h => (
                      <tr key={h.id} style={{ borderBottom: '1px solid #2e3238' }}>
                        <td className="p-2 text-gray-300">{h.fecha}</td>
                        <td className="p-2 text-gray-300">{h.placa} ({h.tipo})</td>
                        <td className="p-2 text-center">{h.horas_trabajadas}</td>
                        <td className="p-2 text-center">{h.es_noche ? '🌙 Noche' : '☀️ Día'}</td>
                        <td className="p-2 text-right font-bold" style={{ color: '#d4a03a' }}>${h.monto_calculado.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
