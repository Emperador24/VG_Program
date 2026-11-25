import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Nomina() {
  const [tab, setTab] = useState('operarios') // operarios | trabajadores
  const [operarios, setOperarios] = useState([])
  const [trabajadores, setTrabajadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [detalleOperario, setDetalleOperario] = useState(null)
  const [detalleTrabajador, setDetalleTrabajador] = useState(null)
  const [formPago, setFormPago] = useState({ dias_trabajados: '', base: '', bonos: '', adelantos: '', descuentos: '', fecha_pago: new Date().toISOString().split('T')[0] })
  const [guardando, setGuardando] = useState(false)
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  useEffect(() => {
    if (tab === 'operarios') {
      fetchOperarios()
    } else {
      fetchTrabajadores()
    }
  }, [tab])

  const fetchOperarios = async () => {
    try {
      const res = await fetch(`${API_URL}/operarios`, { headers: { Authorization: `Bearer ${token}` } })
      setOperarios(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrabajadores = async () => {
    try {
      const res = await fetch(`${API_URL}/trabajadores`, { headers: { Authorization: `Bearer ${token}` } })
      setTrabajadores(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOperario = (id) => {
    setSelectedId(id)
    const op = operarios.find(o => o.id === id)
    setDetalleOperario(op)
    setFormPago({ ...formPago, base: op.salario_diario || 0 })
  }

  const handleSelectTrabajador = (id) => {
    setSelectedId(id)
    const trab = trabajadores.find(t => t.id === id)
    setDetalleTrabajador(trab)
    setFormPago({ ...formPago, base: trab.salario_diario || 0 })
  }

  const calcularNetoPago = () => {
    let neto = 0
    if (tab === 'operarios') {
      // Operario: (salario_diario × días) + bonos - adelantos - descuentos
      neto = (parseFloat(formPago.base) * parseFloat(formPago.dias_trabajados || 0)) + (parseFloat(formPago.bonos) || 0) - (parseFloat(formPago.adelantos) || 0) - (parseFloat(formPago.descuentos) || 0)
    } else {
      // Trabajador: base + bonos - adelantos - descuentos (el monto es directo)
      neto = parseFloat(formPago.base) + (parseFloat(formPago.bonos) || 0) - (parseFloat(formPago.adelantos) || 0) - (parseFloat(formPago.descuentos) || 0)
    }
    return neto.toFixed(2)
  }

  const handleRegistrarPago = async (e) => {
    e.preventDefault()
    if (tab === 'operarios' && !formPago.dias_trabajados) {
      alert('Ingresa días trabajados')
      return
    }

    setGuardando(true)
    try {
      const neto = calcularNetoPago()
      const res = await fetch(`${API_URL}/nomina/pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          [`${tab === 'operarios' ? 'operario' : 'trabajador'}_id`]: selectedId,
          periodo_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          periodo_fin: new Date().toISOString().split('T')[0],
          base: parseFloat(formPago.base),
          bonos: parseFloat(formPago.bonos) || 0,
          adelantos: parseFloat(formPago.adelantos) || 0,
          descuentos: parseFloat(formPago.descuentos) || 0,
          neto: parseFloat(neto),
          fecha_pago: formPago.fecha_pago,
          tipo: tab
        })
      })

      if (res.ok) {
        setFormPago({ dias_trabajados: '', base: '', bonos: '', adelantos: '', descuentos: '', fecha_pago: new Date().toISOString().split('T')[0] })
        setSelectedId(null)
        alert('Pago registrado')
        if (tab === 'operarios') fetchOperarios()
        else fetchTrabajadores()
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return <p className="text-gray-400">Cargando...</p>

  const items = tab === 'operarios' ? operarios : trabajadores

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>📋 Nómina</h1>

      {/* TABS */}
      <div className="flex gap-2">
        {[
          { key: 'operarios', label: '👷 Operarios (Salario Diario)' },
          { key: 'trabajadores', label: '🛠️ Trabajadores (Mensual/Semanal)' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded font-bold text-sm transition-all"
            style={{
              background: tab === t.key ? '#d4a03a' : '#181a1e',
              color: tab === t.key ? '#0e0f11' : '#a3aab3',
              border: '1px solid #2e3238'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SELECTOR */}
      <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        <h2 className="text-lg font-bold mb-3" style={{ color: '#d4a03a' }}>Seleccionar {tab === 'operarios' ? 'Operario' : 'Trabajador'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => tab === 'operarios' ? handleSelectOperario(item.id) : handleSelectTrabajador(item.id)}
              className="p-3 rounded text-left transition-all"
              style={{
                background: selectedId === item.id ? '#d4a03a40' : '#0e0f1140',
                border: `1px solid ${selectedId === item.id ? '#d4a03a' : '#2e3238'}`,
                color: selectedId === item.id ? '#d4a03a' : '#a3aab3'
              }}
            >
              <p className="font-bold">{item.nombre}</p>
              <p className="text-xs">${tab === 'operarios' ? item.salario_diario : item.salario_diario} {tab === 'operarios' ? '/día' : ''}</p>
              {tab === 'trabajadores' && <p className="text-xs">{item.tipo_pago}</p>}
            </button>
          ))}
        </div>
      </div>

      {/* FORMULARIO PAGO */}
      {selectedId && (
        <form onSubmit={handleRegistrarPago} className="p-4 rounded space-y-4" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <h2 className="text-lg font-bold" style={{ color: '#d4a03a' }}>Registrar Pago</h2>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {tab === 'operarios' && (
              <input
                type="number"
                placeholder="Días Trabajados *"
                value={formPago.dias_trabajados}
                onChange={(e) => setFormPago({ ...formPago, dias_trabajados: e.target.value })}
                className="p-2 rounded text-sm"
                style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
              />
            )}
            <input
              type="number"
              placeholder={tab === 'operarios' ? 'Salario/Día' : 'Monto Base'}
              value={formPago.base}
              onChange={(e) => setFormPago({ ...formPago, base: e.target.value })}
              className="p-2 rounded text-sm"
              style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
            />
            <input
              type="number"
              placeholder="Bonos"
              value={formPago.bonos}
              onChange={(e) => setFormPago({ ...formPago, bonos: e.target.value })}
              className="p-2 rounded text-sm"
              style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
            />
            <input
              type="number"
              placeholder="Adelantos"
              value={formPago.adelantos}
              onChange={(e) => setFormPago({ ...formPago, adelantos: e.target.value })}
              className="p-2 rounded text-sm"
              style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
            />
            <input
              type="number"
              placeholder="Descuentos"
              value={formPago.descuentos}
              onChange={(e) => setFormPago({ ...formPago, descuentos: e.target.value })}
              className="p-2 rounded text-sm"
              style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
            />
            <input
              type="date"
              value={formPago.fecha_pago}
              onChange={(e) => setFormPago({ ...formPago, fecha_pago: e.target.value })}
              className="p-2 rounded text-sm"
              style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
            />
          </div>

          {/* NETO CALCULADO */}
          <div className="p-3 rounded flex justify-between items-center" style={{ background: '#4cb07a40', border: '1px solid #4cb07a' }}>
            <span style={{ color: '#4cb07a', fontWeight: 'bold' }}>💰 Total a Pagar (Neto):</span>
            <span style={{ color: '#4cb07a', fontSize: '1.5em', fontWeight: 'bold' }}>${calcularNetoPago()}</span>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full px-4 py-2 rounded font-bold text-white"
            style={{ background: '#d4a03a', color: '#0e0f11' }}
          >
            {guardando ? 'Guardando...' : '✓ Registrar Pago'}
          </button>
        </form>
      )}
    </div>
  )
}
