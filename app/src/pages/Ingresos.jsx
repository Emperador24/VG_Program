import { useState } from 'react';
import IngresosList from '../components/IngresosList';
import IngresoForm from '../components/IngresoForm';

export default function Ingresos() {
  const [showForm, setShowForm] = useState(false);
  const [selectedIngreso, setSelectedIngreso] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : {};

  const handleEdit = (ingreso) => {
    setSelectedIngreso(ingreso);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedIngreso(null);
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Ingresos</h1>
          <button
            onClick={() => {
              setSelectedIngreso(null);
              setShowForm(!showForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Ingreso'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {showForm && (
            <div className="lg:col-span-1">
              <IngresoForm
                ingreso={selectedIngreso}
                onSuccess={handleSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
          <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <IngresosList onEdit={handleEdit} refresh={refresh} />
          </div>
        </div>
      </div>
    </div>
  );
}
