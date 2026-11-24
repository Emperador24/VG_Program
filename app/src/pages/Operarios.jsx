import { useState } from 'react';
import OperariosList from '../components/OperariosList';
import OperarioForm from '../components/OperarioForm';

export default function Operarios() {
  const [showForm, setShowForm] = useState(false);
  const [selectedOperario, setSelectedOperario] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : {};

  const handleEdit = (operario) => {
    setSelectedOperario(operario);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedOperario(null);
    setRefresh(prev => prev + 1);
  };

  const isAdmin = usuario?.rol === 'administrador';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Operarios</h1>
          {isAdmin && (
            <button
              onClick={() => {
                setSelectedOperario(null);
                setShowForm(!showForm);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Cancelar' : '+ Nuevo Operario'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {showForm && (
            <div className="lg:col-span-1">
              <OperarioForm
                operario={selectedOperario}
                onSuccess={handleSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
          <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <OperariosList onEdit={handleEdit} refresh={refresh} />
          </div>
        </div>
      </div>
    </div>
  );
}
