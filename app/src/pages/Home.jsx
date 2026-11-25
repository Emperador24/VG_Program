import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@vg.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      navigate('/dashboard')
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0e0f11' }}>
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video 
          autoPlay 
          muted 
          loop 
          className="w-full h-full object-cover opacity-40"
          style={{ filter: 'brightness(0.4)' }}
        >
          <source src="/videos/video1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(14,15,17,0.9) 0%, rgba(31,78,95,0.8) 100%)' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="border-b" style={{ borderColor: '#d4a03a', backgroundColor: 'rgba(14,15,17,0.95)' }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/logo-blanco.png" alt="V&G Logo" className="h-10" />
              <div>
                <div className="text-lg font-bold" style={{ color: '#d4a03a', fontFamily: '"Cormorant Garamond", serif' }}>
                  V&G
                </div>
                <div className="text-xs" style={{ color: '#a3aab3' }}>Proyectos y Servicios</div>
              </div>
            </div>
            <div className="text-sm" style={{ color: '#a3aab3' }}>Gestión Integral de Flota</div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl items-center">
            {/* Left: Content + Gallery */}
            <div className="text-white space-y-8">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#f4f1ea' }}>
                  Gestión Integral
                </h1>
                <h2 className="text-3xl md:text-4xl mb-6" style={{ color: '#d4a03a', fontFamily: '"Cormorant Garamond", serif' }}>
                  de Flota y Operaciones
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed max-w-lg" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Soluciones completas para el control, seguimiento y optimización de tu flota de máquinas y operaciones en el sector de proyectos y servicios.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Máquinas', value: 'Control completo' },
                  { label: 'Operarios', value: 'Gestión eficiente' },
                  { label: 'Gastos', value: 'Seguimiento real' },
                  { label: 'Reportes', value: 'Análisis profundo' }
                ].map((item) => (
                  <div key={item.label} className="border-l-4 pl-4" style={{ borderColor: '#d4a03a' }}>
                    <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#d4a03a' }}>
                      {item.label}
                    </div>
                    <div className="text-sm text-gray-200 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Media Gallery */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i} 
                    className="aspect-square rounded overflow-hidden border border-gray-700 hover:border-amber-600 transition-all"
                  >
                    <img 
                      src={`/images/${i}.jpeg`} 
                      alt={`V&G Proyecto ${i}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Login Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md p-8 rounded" style={{ backgroundColor: '#181a1e', border: '1px solid #2e3238' }}>
                <div className="mb-8 text-center">
                  <img src="/images/logo-ambar.png" alt="V&G Logo" className="h-12 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold" style={{ color: '#f4f1ea', fontFamily: '"IBM Plex Sans", sans-serif' }}>
                    Acceso
                  </h3>
                  <p className="text-sm mt-2" style={{ color: '#a3aab3' }}>Inicia sesión en tu cuenta V&G</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#f4f1ea' }}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-3" style={{ color: '#5b6470' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded text-sm"
                        style={{ backgroundColor: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#f4f1ea' }}>
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-3" style={{ color: '#5b6470' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 rounded text-sm"
                        style={{ backgroundColor: '#08090a', color: '#f4f1ea', border: '1px solid #2e3238' }}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3"
                        style={{ color: '#5b6470' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 rounded text-sm" style={{ backgroundColor: '#8c261c20', color: '#ef6b5e', border: '1px solid #8c261c' }}>
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded font-medium text-sm transition-all duration-200 disabled:opacity-50"
                    style={{ backgroundColor: '#d4a03a', color: '#0e0f11' }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#c89c2f')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#d4a03a')}
                  >
                    {loading ? 'Iniciando sesión...' : 'Acceder'}
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: '#2e3238' }}>
                  <p className="text-xs text-center" style={{ color: '#5b6470' }}>
                    V&G Proyectos y Servicios © 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
