import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import Maquinas from './pages/Maquinas'
import Operarios from './pages/Operarios'
import Ubicaciones from './pages/Ubicaciones'
import Gastos from './pages/Gastos'
import Ingresos from './pages/Ingresos'
import Asignaciones from './pages/Asignaciones'
import Dashboard from './pages/Dashboard'
import Reportes from './pages/Reportes'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes with Layout */}
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/maquinas" element={<Maquinas />} />
          <Route path="/operarios" element={<Operarios />} />
          <Route path="/ubicaciones" element={<Ubicaciones />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/ingresos" element={<Ingresos />} />
          <Route path="/asignaciones" element={<Asignaciones />} />
          <Route path="/reportes" element={<Reportes />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
