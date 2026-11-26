import { Trash2 } from 'lucide-react'

export default function GenericTable({ title, columns, data, loading, onDelete }) {
  if (loading) return <p className="text-gray-400 text-sm">Cargando...</p>

  const isMobile = window.innerWidth < 768

  if (isMobile && data.length > 0) {
    // MOBILE: Cards
    return (
      <div className="space-y-3">
        {title && <h2 className="text-lg font-bold" style={{ color: '#d4a03a' }}>{title}</h2>}
        {data.map((item, idx) => (
          <div key={idx} className="p-3 rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
            <div className="space-y-2">
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between text-sm">
                  <span style={{ color: '#a3aab3' }}>{col.label}</span>
                  <span style={{ color: '#f4f1ea' }} className="font-semibold">
                    {col.render ? col.render(item[col.key]) : item[col.key]}
                  </span>
                </div>
              ))}
              {onDelete && (
                <button
                  onClick={() => onDelete(item.id)}
                  className="mt-2 w-full px-2 py-1 rounded text-xs text-white"
                  style={{ background: '#ef6b5e' }}
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // DESKTOP: Table
  return (
    <div className="space-y-3 overflow-x-auto">
      {title && <h2 className="text-lg font-bold" style={{ color: '#d4a03a' }}>{title}</h2>}
      {data.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #2e3238' }}>
              {columns.map((col) => (
                <th key={col.key} className="text-left p-2" style={{ color: '#d4a03a' }}>
                  {col.label}
                </th>
              ))}
              {onDelete && <th className="text-center p-2" style={{ color: '#d4a03a' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #2e3238' }}>
                {columns.map((col) => (
                  <td key={col.key} className="p-2 text-gray-300">
                    {col.render ? col.render(item[col.key]) : item[col.key]}
                  </td>
                ))}
                {onDelete && (
                  <td className="p-2 text-center">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-400 text-sm p-4">Sin datos</p>
      )}
    </div>
  )
}
