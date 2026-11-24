import { useState, useEffect } from 'react';
import { operariosApi } from '../services/operariosApi';

export default function OperariosList({ onEdit, refresh }) {
  const [operarios, setOperarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarOperarios();
  }, [refresh]);

  const cargarOperarios = async () => {
    try {
      setLoading(true);
      const response = await operariosApi.getAll();
      setOperarios(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar operario?')) {
      try {
        await operariosApi.delete(id);
        cargarOperarios();
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
            <th className="px-4 py-3 text-left">Cédula</th>
            <th className="px-4 py-3 text-left">Teléfono</th>
            <th className="px-4 py-3 text-left">Salario</th>
            <th className="px-4 py-3 text-left">Frecuencia</th>
            <th className="px-4 py-3 text-left">Máquinas</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {operarios.map((op) => (
            <tr key={op.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3 font-semibold">{op.nombre} {op.apellido}</td>
              <td className="px-4 py-3 text-gray-600">{op.cedula}</td>
              <td className="px-4 py-3">{op.telefono || '-'}</td>
              <td className="px-4 py-3">${op.salario}</td>
              <td className="px-4 py-3 text-xs">{op.frecuencia_pago}</td>
              <td className="px-4 py-3">{op.maquinas_activas}/{op.maquinas_asignadas}</td>
              <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${op.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{op.estado}</span></td>
              <td className="px-4 py-3 space-x-2">
                <button onClick={() => onEdit(op)} className="text-blue-600 hover:underline">Editar</button>
                <button onClick={() => handleDelete(op.id)} className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
