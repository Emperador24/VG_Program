import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Configuracion() {
  const [config, setConfig] = useState({
    correo_reportes: '',
    telefono_whatsapp: '',
    nombre_empresa: 'V&G Proyectos y Servicios'
  })
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/config`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setConfig(prevConfig => ({
        ...prevConfig,
        ...data
      }))
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async (clave) => {
    if (!usuario.rol || usuario.rol !== 'administrador') {
      setMensaje('Solo administradores pueden cambiar la configuración')
      return
    }

    setGuardando(true)
    setMensaje('')

    try {
      const res = await fetch(`${API_URL}/config/${clave}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          valor: config[clave],
          descripcion: `Configuración de ${clave}`
        })
      })

      if (res.ok) {
        setMensaje(`✓ ${clave} guardado exitosamente`)
        setTimeout(() => setMensaje(''), 3000)
      } else {
        setMensaje('Error al guardar')
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return <p className="text-gray-400">Cargando configuración...</p>
  }

  if (usuario.rol !== 'administrador') {
    return (
      <div className="p-4 rounded" style={{ background: '#f07a3520', color: '#f07a35', border: '1px solid #f07a35' }}>
        ⚠️ Solo administradores pueden acceder a esta sección
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>
        Configuración
      </h1>

      {mensaje && (
        <div className="p-3 rounded text-sm" style={{ background: '#4cb07a40', color: '#4cb07a', border: '1px solid #4cb07a' }}>
          {mensaje}
        </div>
      )}

      {/* Configuración de Reportes */}
      <div className="p-6 rounded space-y-6" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        <h2 className="text-xl font-bold" style={{ color: '#d4a03a' }}>
          📧 Reportes por Correo
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#d4a03a' }}>
              Correo para Reportes
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={config.correo_reportes || ''}
                onChange={(e) => setConfig({ ...config, correo_reportes: e.target.value })}
                className="flex-1 p-3 rounded text-sm"
                style={{ background: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
                placeholder="correo@vg.com"
              />
              <button
                onClick={() => handleGuardar('correo_reportes')}
                disabled={guardando}
                className="px-4 py-3 rounded font-semibold text-sm flex items-center gap-2 text-white transition-all"
                style={{ background: '#d4a03a', color: '#0e0f11' }}
                onMouseEnter={(e) => (e.target.style.background = '#c89c2f')}
                onMouseLeave={(e) => (e.target.style.background = '#d4a03a')}
              >
                <Save size={16} />
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: '#a3aab3' }}>
              Todos los reportes automáticos se enviarán a este correo
            </p>
          </div>
        </div>

        <div className="p-3 rounded text-sm" style={{ background: '#0e0f1140' }}>
          <p style={{ color: '#d4a03a' }}>📅 Reporte Diario</p>
          <p className="text-xs mt-1" style={{ color: '#a3aab3' }}>Todos los días a las 19:00 (7 PM)</p>
        </div>

        <div className="p-3 rounded text-sm" style={{ background: '#0e0f1140' }}>
          <p style={{ color: '#d4a03a' }}>📊 Reporte Semanal</p>
          <p className="text-xs mt-1" style={{ color: '#a3aab3' }}>Domingos a las 20:00 (8 PM)</p>
        </div>

        <div className="p-3 rounded text-sm" style={{ background: '#0e0f1140' }}>
          <p style={{ color: '#d4a03a' }}>📈 Reporte Quincenal</p>
          <p className="text-xs mt-1" style={{ color: '#a3aab3' }}>Días 1 y 15 a las 06:00 (6 AM)</p>
        </div>

        <div className="p-3 rounded text-sm" style={{ background: '#0e0f1140' }}>
          <p style={{ color: '#d4a03a' }}>📋 Reporte Mensual</p>
          <p className="text-xs mt-1" style={{ color: '#a3aab3' }}>Día 1 de cada mes a las 06:00 (6 AM)</p>
        </div>
      </div>

      {/* WhatsApp (Pendiente) */}
      <div className="p-6 rounded space-y-4" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        <h2 className="text-xl font-bold" style={{ color: '#d4a03a' }}>
          💬 WhatsApp (Pendiente)
        </h2>
        <p className="text-sm" style={{ color: '#a3aab3' }}>
          La integración con WhatsApp para reportes automáticos está en desarrollo. Próximamente podrás configurar el envío de reportes por WhatsApp también.
        </p>
      </div>

      {/* SMTP Configuration (Advanced) */}
      <div className="p-6 rounded space-y-4" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
        <h2 className="text-xl font-bold" style={{ color: '#a3aab3' }}>
          ⚙️ Configuración SMTP (Avanzado)
        </h2>
        <p className="text-xs" style={{ color: '#5b6470' }}>
          Las variables SMTP se configuran en el servidor mediante variables de entorno:
          SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
        </p>
        <ul className="text-xs space-y-1" style={{ color: '#a3aab3' }}>
          <li>• SMTP_HOST: Host del servidor SMTP (ej: smtp.gmail.com)</li>
          <li>• SMTP_PORT: Puerto SMTP (ej: 587)</li>
          <li>• SMTP_USER: Usuario del correo</li>
          <li>• SMTP_PASS: Contraseña o app password</li>
        </ul>
      </div>
    </div>
  )
}
