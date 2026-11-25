import { useState, useEffect } from 'react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Maquinas() {
  const [maquinas, setMaquinas] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchMaquinas()
  }, [])

  const fetchMaquinas = async () => {
    try {
      const res = await fetch(`${API_URL}/maquinas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setMaquinas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'codigo', label: 'CÓDIGO' },
    { key: 'tipo', label: 'TIPO' },
    { key: 'marca', label: 'MARCA' },
    { key: 'modelo', label: 'MODELO' },
    { key: 'estado', label: 'ESTADO' },
  ]

  return (
    <GenericTable
      title="Máquinas"
      columns={columns}
      data={maquinas}
      loading={loading}
    />
  )
}
