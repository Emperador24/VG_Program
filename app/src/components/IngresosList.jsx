import { useState, useEffect } from 'react';
import { ingresosApi } from '../services/ingresosApi';

export default function IngresosList({ onEdit, refresh }) {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, [refresh]);

  const cargar = async () => {
    try {
      setLoading(true);
      const response = await ingresosApi.getAll({});
      setIngresos(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Anular ingreso?')) {
      try {
        await ingresosApi.delete(id);
        cargar();
      } catch (err) {
        setError(err.response?.data?.error || 'Error');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Cliente</th>
              <th className="px-3 py-2 text-left">Máquina</th>
              <th className="px-3 py-2 text-left">Monto USD</th>
              <th className="px-3 py-2 text-left">Descripción</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingresos.map((ing) => (
              <tr key={ing.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{new Date(ing.fecha).toLocaleDateString()}</td>
                <td className="px-3 py-2 font-semibold">{ing.cliente_nombre}</td>
                <td className="px-3 py-2">{ing.maquina_codigo || '-'}</td>
                <td className="px-3 py-2 font-semibold">${ing.monto_usd}</td>
                <td className="px-3 py-2 text-gray-600 text-xs">{ing.descripcion || '-'}</td>
                <td className="px-3 py-2"><span className={`px-2 py-1 rounded text-xs ${ing.estado === 'registrado' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>{ing.estado}</span></td>
                <td className="px-3 py-2 space-x-1">
                  <button onClick={() => onEdit(ing)} className="text-blue-600 text-xs">Editar</button>
                  <button onClick={() => handleDelete(ing.id)} className="text-red-600 text-xs">Anular</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
