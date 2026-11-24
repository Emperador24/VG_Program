import { useState, useEffect } from 'react';
import { asignacionesApi } from '../services/asignacionesApi';

export default function AsignacionForm({ asignacion, maquinas, operarios, ubicaciones, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    maquina_id: '',
    operario_id: '',
    ubicacion_id: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    notas: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (asignacion) setForm(asignacion); }, [asignacion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (asignacion?.id) {
        await asignacionesApi.update(asignacion.id, form);
      } else {
        await asignacionesApi.create(form);
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
      <h2 className="text-xl font-bold">{asignacion?.id ? 'Editar' : 'Nueva'} Asignación</h2>

      <div className="grid grid-cols-1 gap-4">
        <select name="maquina_id" value={form.maquina_id} onChange={handleChange} className="px-3 py-2 border rounded-lg" required>
          <option value="">Máquina</option>
          {maquinas?.map((m) => <option key={m.id} value={m.id}>{m.codigo}</option>)}
        </select>

        <select name="operario_id" value={form.operario_id} onChange={handleChange} className="px-3 py-2 border rounded-lg" required>
          <option value="">Operario</option>
          {operarios?.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
        </select>

        <select name="ubicacion_id" value={form.ubicacion_id} onChange={handleChange} className="px-3 py-2 border rounded-lg" required>
          <option value="">Ubicación</option>
          {ubicaciones?.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
        </select>

        <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange} className="px-3 py-2 border rounded-lg" required />
        <input name="fecha_fin" type="date" value={form.fecha_fin} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
        <textarea name="notas" value={form.notas} onChange={handleChange} placeholder="Notas" rows="2" className="px-3 py-2 border rounded-lg" />
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
