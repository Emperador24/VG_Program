import { useState, useEffect } from 'react';
import { ubicacionesApi } from '../services/ubicacionesApi';

export default function UbicacionesList({ onEdit, refresh }) {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargar();
  }, [refresh]);

  const cargar = async () => {
    try {
      setLoading(true);
      const response = await ubicacionesApi.getAll();
      setUbicaciones(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar ubicación?')) {
      try {
        await ubicacionesApi.delete(id);
        cargar();
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
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-left">Descripción</th>
            <th className="px-4 py-3 text-left">GPS</th>
            <th className="px-4 py-3 text-left">Activas</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ubicaciones.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3 font-semibold">{u.nombre}</td>
              <td className="px-4 py-3">{u.tipo || '-'}</td>
              <td className="px-4 py-3 text-gray-600">{u.descripcion || '-'}</td>
              <td className="px-4 py-3 text-xs">{u.coordenadas_gps || '-'}</td>
              <td className="px-4 py-3">{u.asignaciones_activas}</td>
              <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${u.estado === 'activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{u.estado}</span></td>
              <td className="px-4 py-3 space-x-2">
                <button onClick={() => onEdit(u)} className="text-blue-600 hover:underline">Editar</button>
                <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
