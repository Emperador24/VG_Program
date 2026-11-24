import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [gastosCat, setGastosCat] = useState([]);
  const [ingresosCli, setIngresosCli] = useState([]);
  const [ultGastos, setUltGastos] = useState([]);
  const [ultIngresos, setUltIngresos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [k, gc, ic, ug, ui, al] = await Promise.all([
        axios.get(`${API_URL}/dashboard/kpis`, { headers }),
        axios.get(`${API_URL}/dashboard/gastos-categoria`, { headers }),
        axios.get(`${API_URL}/dashboard/ingresos-cliente`, { headers }),
        axios.get(`${API_URL}/dashboard/ultimos-gastos`, { headers }),
        axios.get(`${API_URL}/dashboard/ultimos-ingresos`, { headers }),
        axios.get(`${API_URL}/dashboard/alertas`, { headers }),
      ]);

      setKpis(k.data);
      setGastosCat(gc.data);
      setIngresosCli(ic.data);
      setUltGastos(ug.data);
      setUltIngresos(ui.data);
      setAlertas(al.data);
      setLoading(false);
    } catch (err) {
      console.error('Error cargando dashboard');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-16">Cargando...</div>;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {alertas.length > 0 && (
          <div className="mb-6 space-y-2">
            {alertas.map((a, i) => (
              <div key={i} className={`p-4 rounded ${a.tipo === 'warning' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {a.mensaje}
              </div>
            ))}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Gastos Hoy</div>
            <div className="text-3xl font-bold text-red-600">${kpis?.gastos.hoy.toFixed(2)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Gastos Semana</div>
            <div className="text-3xl font-bold text-red-600">${kpis?.gastos.semana.toFixed(2)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Ingresos Mes</div>
            <div className="text-3xl font-bold text-green-600">${kpis?.ingresos.mes.toFixed(2)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Ganancia Mes</div>
            <div className="text-3xl font-bold text-blue-600">${(kpis?.ingresos.mes - kpis?.gastos.mes).toFixed(2)}</div>
          </div>
        </div>

        {/* Estado Flota */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 mb-2">Máquinas Totales</div>
            <div className="text-2xl font-bold">{kpis?.maquinas.total}</div>
            <div className="text-sm text-gray-600 mt-2">Asignadas: {kpis?.maquinas.asignadas} | Disponibles: {kpis?.maquinas.disponibles}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 mb-2">Operarios Activos</div>
            <div className="text-2xl font-bold">{kpis?.operarios.activos}</div>
            <div className="text-sm text-gray-600 mt-2">En licencia: {kpis?.operarios.licencia}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 mb-2">Rentabilidad</div>
            <div className="text-2xl font-bold">{kpis?.ingresos.mes > 0 ? ((kpis?.ingresos.mes - kpis?.gastos.mes) / kpis?.ingresos.mes * 100).toFixed(1) : 0}%</div>
            <div className="text-sm text-gray-600 mt-2">(Ingresos - Gastos) / Ingresos</div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gastos por Categoría */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Gastos por Categoría (30 días)</h3>
            {gastosCat.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gastosCat}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="text-center py-8 text-gray-600">Sin datos</div>}
          </div>

          {/* Ingresos por Cliente */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Ingresos por Cliente (30 días)</h3>
            {ingresosCli.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={ingresosCli} dataKey="total" nameKey="nombre" cx="50%" cy="50%" outerRadius={100} label>
                    {ingresosCli.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="text-center py-8 text-gray-600">Sin datos</div>}
          </div>
        </div>

        {/* Tablas Últimas Transacciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Últimos Gastos */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Últimos 5 Gastos Aprobados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Categoría</th>
                    <th className="px-3 py-2 text-left">Monto USD</th>
                  </tr>
                </thead>
                <tbody>
                  {ultGastos.map((g) => (
                    <tr key={g.id} className="border-t">
                      <td className="px-3 py-2">{new Date(g.fecha).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{g.categoria_nombre}</td>
                      <td className="px-3 py-2 font-semibold">${g.monto_usd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Últimos Ingresos */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Últimos 5 Ingresos Registrados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Cliente</th>
                    <th className="px-3 py-2 text-left">Monto USD</th>
                  </tr>
                </thead>
                <tbody>
                  {ultIngresos.map((i) => (
                    <tr key={i.id} className="border-t">
                      <td className="px-3 py-2">{new Date(i.fecha).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{i.cliente_nombre}</td>
                      <td className="px-3 py-2 font-semibold">${i.monto_usd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
