import { useState, useEffect } from 'react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Operarios() {
  const [operarios, setOperarios] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchOperarios()
  }, [])

  const fetchOperarios = async () => {
    try {
      const res = await fetch(`${API_URL}/operarios`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setOperarios(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'nombre', label: 'NOMBRE' },
    { key: 'cedula', label: 'CÉDULA' },
    { key: 'cargo', label: 'CARGO' },
    { key: 'monto_pago', label: 'PAGO', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
    { key: 'activo', label: 'ESTADO', render: (val) => val ? '✓ Activo' : '✗ Inactivo' },
  ]

  return (
    <GenericTable
      title="Operarios"
      columns={columns}
      data={operarios}
      loading={loading}
      onAdd={() => alert('Próximamente')}
    />
  )
}
