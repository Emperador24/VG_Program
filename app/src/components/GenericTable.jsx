export default function GenericTable({ title, columns, data, loading, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#d4a03a' }}>
          {title}
        </h1>
        {onAdd && (
          <button
            onClick={onAdd}
            className="px-4 py-2 rounded text-sm font-bold text-white transition-all"
            style={{ background: '#d4a03a', color: '#0e0f11' }}
            onMouseEnter={(e) => (e.target.style.background = '#c89c2f')}
            onMouseLeave={(e) => (e.target.style.background = '#d4a03a')}
          >
            + Nuevo
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-400">Sin registros</p>
      ) : (
        <div className="overflow-x-auto rounded" style={{ background: '#181a1e', border: '1px solid #2e3238' }}>
          <table className="w-full text-sm">
            <thead style={{ background: '#0e0f1180' }}>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="text-left p-3" style={{ color: '#d4a03a' }}>
                    {col.label}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="text-center p-3" style={{ color: '#d4a03a' }}>
                    ACCIONES
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #2e3238' }}>
                  {columns.map((col) => (
                    <td key={col.key} className="p-3 text-gray-300">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="p-3 text-center space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-blue-500 hover:text-blue-400 text-xs"
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row.id)}
                          className="text-red-500 hover:text-red-400 text-xs"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
