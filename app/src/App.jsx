import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Maquinas from './pages/Maquinas'
import Operarios from './pages/Operarios'
import Ubicaciones from './pages/Ubicaciones'
import Gastos from './pages/Gastos'
import Ingresos from './pages/Ingresos'
import Asignaciones from './pages/Asignaciones'
import Dashboard from './pages/Dashboard'
import Reportes from './pages/Reportes'

function StatusPage() {
  const [apiStatus, setApiStatus] = useState('Loading...')
  const [dbStatus, setDbStatus] = useState('Loading...')

  useEffect(() => {
    // Check API health
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/health`)
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(err => setApiStatus('ERROR'))

    // Check DB connection
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/db-test`)
      .then(res => res.json())
      .then(data => setDbStatus(data.status))
      .catch(err => setDbStatus('ERROR'))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">V&G Proyectos y Servicios</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">API Status</h2>
            <p className={`text-lg ${apiStatus === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
              {apiStatus === 'OK' ? '✓ Connected' : '✗ Disconnected'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Database Status</h2>
            <p className={`text-lg ${dbStatus === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
              {dbStatus === 'OK' ? '✓ Connected' : '✗ Disconnected'}
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Fase 1: MVP Básico</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Autenticación de usuarios</li>
            <li>Gestión de máquinas y flota</li>
            <li>Gestión de operarios</li>
            <li>Gestión de ubicaciones</li>
            <li>Registro de gastos diarios</li>
            <li>Panel de control (Dashboard)</li>
          </ul>
          <a href="/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Ir al Login →
          </a>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/maquinas" element={<Maquinas />} />
        <Route path="/operarios" element={<Operarios />} />
        <Route path="/ubicaciones" element={<Ubicaciones />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/ingresos" element={<Ingresos />} />
        <Route path="/asignaciones" element={<Asignaciones />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </Router>
  )
}

export default App
