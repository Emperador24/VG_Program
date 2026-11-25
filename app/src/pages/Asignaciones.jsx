import { useState, useEffect } from 'react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch(`${API_URL}/asignaciones`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setAsignaciones(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const columns = [
    { key: 'maquina_id', label: 'MÁQUINA' },
    { key: 'operario_id', label: 'OPERARIO' },
    { key: 'fecha_inicio', label: 'INICIO' },
    { key: 'fecha_fin', label: 'FIN' },
  ]

  return (
    <GenericTable
      title="Asignaciones"
      columns={columns}
      data={asignaciones}
      loading={loading}
    />
  )
}
