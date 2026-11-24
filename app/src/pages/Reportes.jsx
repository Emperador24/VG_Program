import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export default function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    cargarReportes();
  }, [filtroTipo]);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const params = filtroTipo ? `?tipo=${filtroTipo}` : '';
      const response = await axios.get(`${API_URL}/reportes${params}`, { headers });
      setReportes(response.data);
    } catch (err) {
      console.error('Error cargando reportes');
    } finally {
      setLoading(false);
    }
  };

  const generarReporte = async (tipo) => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/reportes/generar/${tipo}`, {}, { headers });
      cargarReportes();
    } catch (err) {
      alert('Error generando reporte');
    } finally {
      setGenerating(false);
    }
  };

  const descargarPDF = (reporte) => {
    const contenido = reporte.contenido ? JSON.parse(reporte.contenido) : {};
    const doc = `
      ${contenido.titulo}
      Generado: ${new Date(reporte.fecha_generacion).toLocaleString()}
      
      ${JSON.stringify(contenido, null, 2)}
    `;
    const blob = new Blob([doc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${contenido.tipo}-${reporte.id}.txt`;
    a.click();
  };

  if (loading) return <div className="text-center py-16">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Reportes</h1>

        {/* Generadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => generarReporte('diario')}
            disabled={generating}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generando...' : '📊 Generar Diario'}
          </button>
          <button
            onClick={() => generarReporte('semanal')}
            disabled={generating}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generando...' : '📈 Generar Semanal'}
          </button>
          <button
            onClick={() => generarReporte('mensual')}
            disabled={generating}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generando...' : '📉 Generar Mensual'}
          </button>
        </div>

        {/* Filtro */}
        <div className="mb-6">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Todos</option>
            <option value="diario">Diarios</option>
            <option value="semanal">Semanales</option>
            <option value="mensual">Mensuales</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Tipo</th>
                <th className="px-6 py-3 text-left">Generado</th>
                <th className="px-6 py-3 text-left">Período</th>
                <th className="px-6 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((r) => {
                const contenido = r.contenido ? JSON.parse(r.contenido) : {};
                return (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold capitalize">{r.tipo}</td>
                    <td className="px-6 py-3">{new Date(r.fecha_generacion).toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {contenido.fecha || `${contenido.fechaInicio} a ${contenido.fechaFin}` || `${contenido.mes}/${contenido.anio}`}
                    </td>
                    <td className="px-6 py-3 space-x-2">
                      <button onClick={() => descargarPDF(r)} className="text-blue-600 hover:underline text-sm">
                        Descargar
                      </button>
                      <button onClick={() => alert(JSON.stringify(contenido, null, 2))} className="text-green-600 hover:underline text-sm">
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
