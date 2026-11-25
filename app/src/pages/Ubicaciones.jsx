import { useState, useEffect } from 'react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Ubicaciones() {
  const [ubicaciones, setUbicaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch(`${API_URL}/ubicaciones`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setUbicaciones(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const columns = [
    { key: 'nombre', label: 'UBICACIÓN' },
    { key: 'estado_municipio', label: 'MUNICIPIO' },
  ]

  return (
    <GenericTable
      title="Ubicaciones"
      columns={columns}
      data={ubicaciones}
      loading={loading}
    />
  )
}
