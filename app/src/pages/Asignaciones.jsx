import { useState, useEffect } from 'react';
import AsignacionesList from '../components/AsignacionesList';
import AsignacionForm from '../components/AsignacionForm';
import { asignacionesApi } from '../services/asignacionesApi';
import { maquinasApi } from '../services/maquinasApi';
import { operariosApi } from '../services/operariosApi';
import { ubicacionesApi } from '../services/ubicacionesApi';

export default function Asignaciones() {
  const [showForm, setShowForm] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [maquinas, setMaquinas] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [m, o, u] = await Promise.all([
        maquinasApi.getAll(),
        operariosApi.getAll(),
        ubicacionesApi.getAll(),
      ]);
      setMaquinas(m.data);
      setOperarios(o.data);
      setUbicaciones(u.data);
    } catch (err) {
      console.error('Error cargando datos');
    }
  };

  const handleEdit = (asignacion) => {
    setSelectedAsignacion(asignacion);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedAsignacion(null);
    setRefresh(prev => prev + 1);
  };

  const handleFinalizar = async (id) => {
    if (confirm('¿Finalizar asignación?')) {
      try {
        await asignacionesApi.finalizar(id, new Date().toISOString().split('T')[0]);
        setRefresh(prev => prev + 1);
      } catch (err) {
        alert('Error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Asignaciones</h1>
          <button
            onClick={() => { setSelectedAsignacion(null); setShowForm(!showForm); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : '+ Nueva Asignación'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {showForm && (
            <div className="lg:col-span-1">
              <AsignacionForm
                asignacion={selectedAsignacion}
                maquinas={maquinas}
                operarios={operarios}
                ubicaciones={ubicaciones}
                onSuccess={handleSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
          <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <AsignacionesList onEdit={handleEdit} onFinalizar={handleFinalizar} refresh={refresh} />
          </div>
        </div>
      </div>
    </div>
  );
}
