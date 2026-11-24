import { useState, useEffect } from 'react';
import { gastosApi } from '../services/gastosApi';

export default function GastosList({ onEdit, refresh }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => { cargar(); }, [refresh]);

  const cargar = async () => {
    try {
      setLoading(true);
      const response = await gastosApi.getAll({ estado: filtroEstado });
      setGastos(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [filtroEstado]);

  const handleAprobar = async (id) => {
    try {
      await gastosApi.aprobar(id);
      cargar();
    } catch (err) {
      alert('Error: ' + err.response?.data?.error);
    }
  };

  const handleRechazar = async (id) => {
    try {
      await gastosApi.rechazar(id);
      cargar();
    } catch (err) {
      alert('Error: ' + err.response?.data?.error);
    }
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="mb-4 flex gap-2">
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="px-3 py-2 border rounded">
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Categoría</th>
              <th className="px-3 py-2 text-left">Monto USD</th>
              <th className="px-3 py-2 text-left">Máquina</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((g) => (
              <tr key={g.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{new Date(g.fecha).toLocaleDateString()}</td>
                <td className="px-3 py-2">{g.categoria_nombre}</td>
                <td className="px-3 py-2 font-semibold">${g.monto_usd}</td>
                <td className="px-3 py-2">{g.maquina_codigo || '-'}</td>
                <td className="px-3 py-2"><span className={`px-2 py-1 rounded text-xs ${g.estado === 'aprobado' ? 'bg-green-100 text-green-800' : g.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{g.estado}</span></td>
                <td className="px-3 py-2 space-x-1">
                  <button onClick={() => onEdit(g)} className="text-blue-600 text-xs">Editar</button>
                  {g.estado === 'pendiente' && (
                    <>
                      <button onClick={() => handleAprobar(g.id)} className="text-green-600 text-xs">✓</button>
                      <button onClick={() => handleRechazar(g.id)} className="text-red-600 text-xs">✕</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
