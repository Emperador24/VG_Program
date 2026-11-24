import { useState, useEffect } from 'react';
import { asignacionesApi } from '../services/asignacionesApi';

export default function AsignacionesList({ onEdit, onFinalizar, refresh }) {
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('activa');

  useEffect(() => { cargar(); }, [refresh, filtroEstado]);

  const cargar = async () => {
    try {
      setLoading(true);
      const response = await asignacionesApi.getAll({ estado: filtroEstado });
      setAsignaciones(response.data);
    } catch (err) {
      console.error('Error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="mb-4">
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="px-3 py-2 border rounded">
          <option value="activa">Activas</option>
          <option value="finalizada">Finalizadas</option>
          <option value="">Todas</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Máquina</th>
              <th className="px-3 py-2 text-left">Operario</th>
              <th className="px-3 py-2 text-left">Ubicación</th>
              <th className="px-3 py-2 text-left">Inicio</th>
              <th className="px-3 py-2 text-left">Fin</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignaciones.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 font-semibold">{a.maquina_codigo}</td>
                <td className="px-3 py-2">{a.operario_nombre}</td>
                <td className="px-3 py-2">{a.ubicacion_nombre}</td>
                <td className="px-3 py-2 text-xs">{new Date(a.fecha_inicio).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-xs">{a.fecha_fin ? new Date(a.fecha_fin).toLocaleDateString() : '-'}</td>
                <td className="px-3 py-2"><span className={`px-2 py-1 rounded text-xs ${a.estado === 'activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{a.estado}</span></td>
                <td className="px-3 py-2 space-x-1">
                  <button onClick={() => onEdit(a)} className="text-blue-600 text-xs">Editar</button>
                  {a.estado === 'activa' && <button onClick={() => onFinalizar(a.id)} className="text-red-600 text-xs">Finalizar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
