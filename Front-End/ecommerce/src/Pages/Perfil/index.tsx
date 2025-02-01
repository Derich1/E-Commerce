import React from 'react';

interface UserProfile {
  name: string;
  email: string;
  telefone: string;
  datanascimento: string;
}

const Perfil: React.FC = () => {
  const user: UserProfile = {
    name: "Luxy Elu",
    email: "luxyelu@gmail.com",
    telefone: "123-456-789",
    datanascimento: "1990-01-01",
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Dados do Perfil</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600">Nome</label>
          <p className="mt-1 text-gray-800">{user.name}</p>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-600">E-mail</label>
          <p className="mt-1 text-gray-800">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600">Telefone</label>
          <p className="mt-1 text-gray-800">{user.telefone}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600">Data de Nascimento</label>
          <p className="mt-1 text-gray-800">{user.datanascimento}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none">
          Editar Perfil
        </button>
      </div>
    </div>
  );
};

export default Perfil;
