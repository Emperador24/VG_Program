import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Máquinas', path: '/maquinas', icon: '🚜' },
    { label: 'Operarios', path: '/operarios', icon: '👷' },
    { label: 'Trabajadores', path: '/trabajadores', icon: '🛠️' },
    { label: 'Ubicaciones', path: '/ubicaciones', icon: '📍' },
    { label: 'Gastos', path: '/gastos', icon: '💰' },
    { label: 'Ingresos', path: '/ingresos', icon: '💵' },
    { label: 'Asignaciones', path: '/asignaciones', icon: '🔄' },
    { label: 'Reportes', path: '/reportes', icon: '📋' },
    { label: 'Nómina', path: '/nomina', icon: '💼' },
    { label: 'Análisis', path: '/analisis', icon: '📈' },
    { label: 'Configuración', path: '/configuracion', icon: '⚙️' },
  ]

  // Obtener página actual
  const currentPage = menuItems.find(item => item.path === location.pathname)?.label || 'V&G'

  const closeSidebarIfMobile = () => {
    if (isMobile) setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0e0f11' }}>
      {/* Overlay para móvil */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen z-40 transition-all duration-300 ${
          sidebarOpen ? (isMobile ? 'w-64' : 'w-64') : 'w-0'
        } overflow-hidden md:relative md:w-64 md:translate-x-0`}
        style={{ background: '#181a1e', borderRight: '1px solid #2e3238' }}
      >
        <div className="p-4 md:p-6 border-b" style={{ borderColor: '#d4a03a' }}>
          <img src="/images/logo-blanco.png" alt="V&G" className="h-6 md:h-8" />
          <p className="text-xs mt-2" style={{ color: '#a3aab3' }}>
            Sistema de Control
          </p>
        </div>

        <nav className="p-2 md:p-4 space-y-1 md:space-y-2 overflow-y-auto h-[calc(100vh-100px)]">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path)
                closeSidebarIfMobile()
              }}
              className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded text-xs md:text-sm flex items-center gap-2 md:gap-3 transition-all ${
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
              <span className="text-lg md:text-xl">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
              {location.pathname === item.path && (
                <ChevronRight size={16} className="ml-auto hidden sm:block" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Top Navbar */}
        <nav
          className="sticky top-0 z-30 border-b"
          style={{ borderColor: '#2e3238', background: '#181a1e' }}
        >
          <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white md:hidden"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-lg md:text-xl font-bold" style={{ color: '#d4a03a' }}>
                {currentPage === 'V&G' ? 'V&G' : `${currentPage}`}
              </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
              <div className="text-xs md:text-sm truncate" style={{ color: '#a3aab3' }}>
                👤 <span className="hidden sm:inline">{usuario.nombre || usuario.correo || 'Usuario'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded text-xs md:text-sm text-white transition-all hover:opacity-80"
                style={{ background: '#d4a03a', color: '#0e0f11' }}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-3 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
