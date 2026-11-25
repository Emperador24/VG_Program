import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Nomina() {
  const { data: operarios, loading } = useApi(`${API_URL}/operarios`)
  const [selectedOperario, setSelectedOperario] = useState(null)
  const [detalleOperario, setDetalleOperario] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (selectedOperario) {
      fetch(`${API_URL}/nominaService/operario/${selectedOperario}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setDetalleOperario(data))
        .catch(err => console.error(err))
    }
  }, [selectedOperario])

  if (loading) return <p className="text-gray-400">Cargando...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>
        📋 Nómina
      </h1>

      {/* SELECCIONAR OPERARIO */}
      <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        <h2 className="text-lg font-bold mb-3" style={{ color: '#d4a03a' }}>Seleccionar Operario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {operarios.map(o => (
            <button
              key={o.id}
              onClick={() => setSelectedOperario(o.id)}
              className="p-3 rounded text-left transition-all"
              style={{
                background: selectedOperario === o.id ? '#d4a03a40' : '#0e0f1140',
                border: `1px solid ${selectedOperario === o.id ? '#d4a03a' : '#2e3238'}`,
                color: selectedOperario === o.id ? '#d4a03a' : '#a3aab3'
              }}
            >
              <p className="font-bold">{o.nombre}</p>
              <p className="text-xs">${o.monto_pago.toFixed(2)} {o.tipo_pago}</p>
            </button>
          ))}
        </div>
      </div>

      {/* DETALLE OPERARIO */}
      {detalleOperario && (
        <div className="space-y-4">
          <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
            <h2 className="text-lg font-bold mb-3" style={{ color: '#d4a03a' }}>{detalleOperario.nombre}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Cédula', value: detalleOperario.cedula },
                { label: 'Cargo', value: detalleOperario.cargo },
                { label: 'Pago', value: `$${detalleOperario.monto_pago} ${detalleOperario.tipo_pago}` },
                { label: 'Total Pagado', value: `$${detalleOperario.totalPagadoHistorico.toFixed(2)}` }
              ].map(item => (
                <div key={item.label} className="p-2 rounded" style={{ background: '#0e0f1140' }}>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="font-bold text-gray-200">{item.value}</p>
                </div>
              ))}
            </div>

            {detalleOperario.asignacionActual && (
              <div className="mt-3 p-2 rounded" style={{ background: '#4cb07a40', color: '#4cb07a' }}>
                📌 Actualmente asignado a: <strong>{detalleOperario.asignacionActual.maquina_codigo}</strong>
              </div>
            )}
          </div>

          {/* HISTÓRICO PAGOS */}
          <div className="p-4 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#d4a03a' }}>Histórico de Pagos</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {detalleOperario.pagosHistorico?.length > 0 ? (
                detalleOperario.pagosHistorico.map(pago => (
                  <div key={pago.id} className="p-2 rounded flex justify-between text-sm" style={{ background: '#0e0f1140' }}>
                    <span>{pago.periodo_inicio} al {pago.periodo_fin}</span>
                    <span style={{ color: '#d4a03a', fontWeight: 'bold' }}>${pago.neto.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Sin pagos registrados</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
