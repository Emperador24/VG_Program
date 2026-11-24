import { useState, useEffect } from 'react';
import { ubicacionesApi } from '../services/ubicacionesApi';

export default function UbicacionForm({ ubicacion, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'campo',
    coordenadas_gps: '',
    descripcion: '',
    estado: 'activa',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ubicacion) setForm(ubicacion);
  }, [ubicacion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (ubicacion?.id) {
        await ubicacionesApi.update(ubicacion.id, form);
      } else {
        await ubicacionesApi.create(form);
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
      <h2 className="text-xl font-bold">{ubicacion?.id ? 'Editar' : 'Nueva'} Ubicación</h2>

      <div className="grid grid-cols-1 gap-4">
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />

        <select name="tipo" value={form.tipo} onChange={handleChange} className="px-3 py-2 border rounded-lg">
          <option value="campo">Campo</option>
          <option value="taller">Taller</option>
          <option value="almacen">Almacén</option>
          <option value="oficina">Oficina</option>
          <option value="otro">Otro</option>
        </select>

        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción (campo, pozo, dirección)" rows="3" className="px-3 py-2 border rounded-lg" />

        <input name="coordenadas_gps" value={form.coordenadas_gps} onChange={handleChange} placeholder="GPS (latitud,longitud)" className="px-3 py-2 border rounded-lg text-sm" />

        <select name="estado" value={form.estado} onChange={handleChange} className="px-3 py-2 border rounded-lg">
          <option value="activa">Activa</option>
          <option value="inactiva">Inactiva</option>
          <option value="mantenimiento">Mantenimiento</option>
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
