import { useState, useEffect } from 'react';
import { gastosApi } from '../services/gastosApi';

export default function GastoForm({ gasto, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    maquina_id: '',
    operario_id: '',
    categoria_id: '',
    monto_usd: '',
    monto_bolivares: '',
    tasa: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    evidencia_url: '',
  });
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCategorias();
    if (gasto) setForm(gasto);
  }, [gasto]);

  const cargarCategorias = async () => {
    try {
      const response = await gastosApi.getCategorias();
      setCategorias(response.data);
    } catch (err) {
      console.error('Error cargando categorías');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (gasto?.id) {
        await gastosApi.update(gasto.id, form);
      } else {
        await gastosApi.create(form);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-bold">{gasto?.id ? 'Editar' : 'Nuevo'} Gasto</h2>

      <div className="grid grid-cols-1 gap-4">
        <input name="fecha" type="date" value={form.fecha} onChange={handleChange} className="px-3 py-2 border rounded-lg" required />

        <select name="categoria_id" value={form.categoria_id} onChange={handleChange} className="px-3 py-2 border rounded-lg" required>
          <option value="">Seleccionar categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input name="monto_usd" type="number" value={form.monto_usd} onChange={handleChange} placeholder="Monto USD" className="px-3 py-2 border rounded-lg" required step="0.01" />
          <input name="tasa" type="number" value={form.tasa} onChange={handleChange} placeholder="Tasa BCV" className="px-3 py-2 border rounded-lg" step="0.01" />
        </div>

        <input name="monto_bolivares" type="number" value={form.monto_bolivares} onChange={handleChange} placeholder="Monto Bs (opcional)" className="px-3 py-2 border rounded-lg" step="0.01" />

        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" rows="2" className="px-3 py-2 border rounded-lg" />

        <input name="evidencia_url" value={form.evidencia_url} onChange={handleChange} placeholder="URL de evidencia (foto)" className="px-3 py-2 border rounded-lg text-sm" />
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      <div className="flex gap-2 pt-4">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">
          Cancelar
        </button>
      </div>
    </form>
  );
}
