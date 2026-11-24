import { useState, useEffect } from 'react';
import { operariosApi } from '../services/operariosApi';

export default function OperarioForm({ operario, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    email: '',
    salario: '',
    frecuencia_pago: 'mensual',
    estado: 'activo',
    fecha_contratacion: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (operario) setForm(operario);
  }, [operario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (operario?.id) {
        await operariosApi.update(operario.id, form);
      } else {
        await operariosApi.create(form);
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
      <h2 className="text-xl font-bold">{operario?.id ? 'Editar' : 'Nuevo'} Operario</h2>

      <div className="grid grid-cols-2 gap-4">
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" className="px-3 py-2 border rounded-lg" required />

        <input name="cedula" value={form.cedula} onChange={handleChange} placeholder="Cédula" className="px-3 py-2 border rounded-lg" required />
        <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="px-3 py-2 border rounded-lg" />

        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="px-3 py-2 border rounded-lg" />
        <input name="salario" type="number" value={form.salario} onChange={handleChange} placeholder="Salario USD" className="px-3 py-2 border rounded-lg" />

        <select name="frecuencia_pago" value={form.frecuencia_pago} onChange={handleChange} className="px-3 py-2 border rounded-lg">
          <option value="semanal">Semanal</option>
          <option value="quincenal">Quincenal</option>
          <option value="mensual">Mensual</option>
        </select>

        <input name="fecha_contratacion" type="date" value={form.fecha_contratacion} onChange={handleChange} className="px-3 py-2 border rounded-lg" />

        <select name="estado" value={form.estado} onChange={handleChange} className="px-3 py-2 border rounded-lg">
          <option value="activo">Activo</option>
          <option value="licencia">Licencia</option>
          <option value="suspendido">Suspendido</option>
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
