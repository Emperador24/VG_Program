import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@vg.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  const carousel = [
    { type: 'image', src: '/images/1.jpeg', duration: 3 },
    { type: 'image', src: '/images/2.jpeg', duration: 3 },
    { type: 'video', src: '/videos/video1.mp4', duration: 12 },
    { type: 'image', src: '/images/3.jpeg', duration: 3 },
    { type: 'image', src: '/images/4.jpeg', duration: 3 },
    { type: 'image', src: '/images/5.jpeg', duration: 3 },
    { type: 'video', src: '/videos/video2.mp4', duration: 12 },
    { type: 'image', src: '/images/6.jpeg', duration: 3 },
    { type: 'image', src: '/images/7.jpeg', duration: 3 },
    { type: 'image', src: '/images/8.jpeg', duration: 3 },
    { type: 'image', src: '/images/9.jpeg', duration: 3 },
  ]

  useEffect(() => {
    const currentItem = carousel[currentIndex]
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % carousel.length)
    }, currentItem.duration * 1000)
    
    return () => clearTimeout(timer)
  }, [currentIndex])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contraseña: password })
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

  const currentItem = carousel[currentIndex]

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0e0f11' }}>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b" style={{ borderColor: '#d4a03a', backgroundColor: 'rgba(14,15,17,0.98)' }}>
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

      {/* Background Carousel */}
      <div className="absolute inset-0 w-full h-full pt-16">
        {/* Images */}
        {currentItem.type === 'image' && (
          <div
            className="absolute inset-0 w-full h-full transition-opacity duration-1000"
            style={{
              backgroundImage: `url('${currentItem.src}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.6) contrast(1.1)'
            }}
          />
        )}

        {/* Videos - NO FULLSCREEN */}
        {currentItem.type === 'video' && (
          <video 
            key={currentItem.src}
            autoPlay 
            muted 
            loop
            playsinline
            controlsList="nodownload nofullscreen"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              filter: 'brightness(0.6) contrast(1.1)',
              pointerEvents: 'none'
            }}
          >
            <source src={currentItem.src} type="video/mp4" />
          </video>
        )}

        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(14,15,17,0.3) 0%, rgba(31,78,95,0.4) 50%, rgba(14,15,17,0.5) 100%)' }}></div>

        {/* Media Counter */}
        <div className="absolute bottom-4 left-4 z-20 text-sm font-semibold" style={{ color: '#d4a03a' }}>
          {currentIndex + 1}/{carousel.length} • {currentItem.type === 'video' ? '🎬 Video' : '📸 Foto'}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col pt-16">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl items-center">
            {/* Left: Content */}
            <div className="text-white space-y-8">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-2" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#f4f1ea' }}>
                  Gestión
                </h1>
                <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#d4a03a' }}>
                  de Flota
                </h1>
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-lg" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Soluciones completas para el control, seguimiento y optimización de tu flota de máquinas y operaciones.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
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
            </div>

            {/* Right: Login */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm p-8 rounded-sm" style={{ backgroundColor: 'rgba(24,26,30,0.98)', border: '2px solid #d4a03a', backdropFilter: 'blur(10px)' }}>
                <div className="mb-6 text-center">
                  <img src="/images/logo-ambar.png" alt="V&G Logo" className="h-14 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold" style={{ color: '#d4a03a', fontFamily: '"Cormorant Garamond", serif' }}>
                    Acceso
                  </h3>
                  <p className="text-xs mt-2" style={{ color: '#a3aab3' }}>Inicia sesión en tu cuenta</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-sm text-sm"
                      style={{ backgroundColor: '#08090a', color: '#f4f1ea', border: '1px solid #d4a03a', outline: 'none' }}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-sm text-sm"
                        style={{ backgroundColor: '#08090a', color: '#f4f1ea', border: '1px solid #d4a03a', outline: 'none' }}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5"
                        style={{ color: '#d4a03a' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-2 rounded-sm text-xs" style={{ backgroundColor: '#8c261c40', color: '#ef6b5e', border: '1px solid #ef6b5e' }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-sm font-semibold text-sm transition-all duration-200 disabled:opacity-50 uppercase tracking-wide"
                    style={{ backgroundColor: '#d4a03a', color: '#0e0f11' }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#c89c2f')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#d4a03a')}
                  >
                    {loading ? 'Accediendo...' : 'Acceder'}
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t" style={{ borderColor: '#d4a03a40' }}>
                  <p className="text-xs text-center" style={{ color: '#5b6470' }}>
                    © 2026 V&G Proyectos y Servicios
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pb-8 relative z-20 animate-bounce">
          <ChevronDown size={24} style={{ color: '#d4a03a' }} />
        </div>
      </div>
    </div>
  )
}
