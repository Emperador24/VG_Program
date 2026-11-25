import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Máquinas', path: '/maquinas', icon: '🚜' },
    { label: 'Operarios', path: '/operarios', icon: '👷' },
    { label: 'Ubicaciones', path: '/ubicaciones', icon: '📍' },
    { label: 'Gastos', path: '/gastos', icon: '💰' },
    { label: 'Ingresos', path: '/ingresos', icon: '💵' },
    { label: 'Asignaciones', path: '/asignaciones', icon: '🔄' },
    { label: 'Reportes', path: '/reportes', icon: '📋' },
    { label: 'Nómina', path: '/nomina', icon: '💼' },
    { label: 'Análisis', path: '/analisis', icon: '📈' },
    { label: 'Configuración', path: '/configuracion', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: '#0e0f11' }}>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
        style={{ background: '#181a1e', borderRight: '1px solid #2e3238' }}
      >
        <div className="p-6 border-b" style={{ borderColor: '#d4a03a' }}>
          <img src="/images/logo-blanco.png" alt="V&G" className="h-8" />
          <p className="text-xs mt-2" style={{ color: '#a3aab3' }}>
            Sistema de Control
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-3 rounded text-sm flex items-center gap-3 transition-all ${
                location.pathname === item.path
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              style={
                location.pathname === item.path
                  ? { background: '#d4a03a40' }
                  : {}
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {location.pathname === item.path && (
                <ChevronRight size={16} className="ml-auto" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Navbar */}
        <nav
          className="sticky top-0 z-30 border-b"
          style={{ borderColor: '#2e3238', background: '#181a1e' }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-xl font-bold" style={{ color: '#d4a03a' }}>
                V&G Sistema
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-sm" style={{ color: '#a3aab3' }}>
                👤 {usuario.nombre || usuario.correo || 'Usuario'}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm text-white transition-all hover:opacity-80"
                style={{ background: '#d4a03a', color: '#0e0f11' }}
              >
                <LogOut size={16} />
                Salir
              </button>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
