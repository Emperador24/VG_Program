import { useState, useEffect } from 'react';
import { maquinasApi } from '../services/maquinasApi';

export default function MaquinasList({ onEdit, refresh }) {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarMaquinas();
  }, [refresh]);

  const cargarMaquinas = async () => {
    try {
      setLoading(true);
      const response = await maquinasApi.getAll();
      setMaquinas(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta máquina?')) {
      try {
        await maquinasApi.delete(id);
        cargarMaquinas();
      } catch (err) {
        setError(err.response?.data?.error || 'Error');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">Código</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-left">Placa</th>
            <th className="px-4 py-3 text-left">Marca Modelo</th>
            <th className="px-4 py-3 text-left">Operario</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {maquinas.map((m) => (
            <tr key={m.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3 font-semibold">{m.codigo}</td>
              <td className="px-4 py-3">{m.tipo}</td>
              <td className="px-4 py-3 text-gray-600">{m.placa_serial}</td>
              <td className="px-4 py-3">{m.marca} {m.modelo}</td>
              <td className="px-4 py-3">{m.operario_nombre || '-'}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  m.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                }`}>
                  {m.estado}
                </span>
              </td>
              <td className="px-4 py-3 space-x-2">
                <button onClick={() => onEdit(m)} className="text-blue-600 hover:underline">Editar</button>
                <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
