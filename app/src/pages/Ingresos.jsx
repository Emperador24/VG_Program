import { useState, useEffect } from 'react'
import GenericTable from '../components/GenericTable'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function Ingresos() {
  const [ingresos, setIngresos] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch(`${API_URL}/ingresos`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setIngresos(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const columns = [
    { key: 'fecha', label: 'FECHA' },
    { key: 'concepto', label: 'CONCEPTO' },
    { key: 'monto_usd', label: 'MONTO', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
    { key: 'estado_cobro', label: 'ESTADO' },
  ]

  return (
    <GenericTable
      title="Ingresos"
      columns={columns}
      data={ingresos}
      loading={loading}
    />
  )
}
