import { useState, useEffect } from 'react';
import { maquinasApi } from '../services/maquinasApi';

export default function MaquinaForm({ maquina, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    codigo: '',
    tipo: 'vacuum',
    placa_serial: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    estado: 'activo',
    fecha_compra: '',
    valor: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (maquina) {
      setForm(maquina);
    }
  }, [maquina]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (maquina?.id) {
        await maquinasApi.update(maquina.id, form);
      } else {
        await maquinasApi.create(form);
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
      <h2 className="text-xl font-bold">{maquina?.id ? 'Editar' : 'Nueva'} Máquina</h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          name="codigo"
          value={form.codigo}
          onChange={handleChange}
          placeholder="Código (ej: RE-01)"
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <select
          name="tipo"
          value={form.tipo}
          onChange={handleChange}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>vacuum</option>
          <option>solador</option>
          <option>batea</option>
          <option>lowboy</option>
          <option>camion_350</option>
        </select>

        <input name="placa_serial" value={form.placa_serial} onChange={handleChange} placeholder="Placa/Serial" className="px-3 py-2 border rounded-lg" />
        <input name="marca" value={form.marca} onChange={handleChange} placeholder="Marca" className="px-3 py-2 border rounded-lg" />

        <input name="modelo" value={form.modelo} onChange={handleChange} placeholder="Modelo" className="px-3 py-2 border rounded-lg" />
        <input name="anio" type="number" value={form.anio} onChange={handleChange} placeholder="Año" className="px-3 py-2 border rounded-lg" />

        <input name="fecha_compra" type="date" value={form.fecha_compra} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
        <input name="valor" type="number" value={form.valor} onChange={handleChange} placeholder="Valor USD" className="px-3 py-2 border rounded-lg" />

        <select name="estado" value={form.estado} onChange={handleChange} className="px-3 py-2 border rounded-lg">
          <option value="activo">Activo</option>
          <option value="taller">Taller</option>
          <option value="parada">Parada</option>
        </select>
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
