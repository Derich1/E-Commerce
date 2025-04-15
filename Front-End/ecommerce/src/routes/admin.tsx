import simpleRestProvider from "ra-data-simple-rest";  // ✅ Adicionado corretamente

import { Admin, CreateResult, Identifier, Resource } from 'react-admin';
import { ProdutoList } from "../Components/Admin/ProdutoList";
import { ProdutoEdit } from "../Components/Admin/ProdutoEdit";
import { ProdutoCreate } from "../Components/Admin/ProdutoCreate";
import { DataProvider, UpdateParams, UpdateResult, RaRecord } from "react-admin";
import { authProvider } from "../AuthProvider";
import CustomLoginPage from "../CustomLandingPage";

const apiUrl = "http://localhost:8082/produto";

const dataProvider: DataProvider = {
  ...simpleRestProvider(apiUrl),

  getList: async () => {
    const response = await fetch(`${apiUrl}`);
    const data = await response.json();
    return { data, total: data.length };
  },

  getOne: async (_resource, params) => {
    const response = await fetch(`${apiUrl}/${params.id}`);
    const data = await response.json();
    return { data };
  },

  create: async <RecordType extends Omit<RaRecord, 'id'>, ResultRecordType extends RaRecord = RecordType & { id: Identifier }>(
    _resource: string,
    params: { data: RecordType }
  ): Promise<CreateResult<ResultRecordType>> => {
    const response = await fetch(`${apiUrl}/cadastrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params.data),
    });
  
    if (!response.ok) {
      throw new Error("Erro ao cadastrar o item");
    }
  
    const textResponse = await response.text();
    console.log("Resposta do Backend:", textResponse);
  
    // Retorne um objeto com a string e use type assertion para compatibilizá-lo
    return { data: { message: textResponse } } as unknown as CreateResult<ResultRecordType>;
  },

  delete: async <RecordType extends RaRecord>(
    _resource: string,
    params: { id: Identifier }
  ): Promise<{ data: RecordType }> => {
    const response = await fetch(`${apiUrl}/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    if (!response.ok) {
      throw new Error("Erro ao deletar o item");
    }
  
    const data = await response.json();
    return { data };
  },
  
  update: async <RecordType extends RaRecord>(
    _resource: string,
    params: UpdateParams<RecordType>
  ): Promise<UpdateResult<RecordType>> => {

    const response = await fetch(`${apiUrl}/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params.data),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar o item");
    }

    const json = await response.json();
    return { data: json };
  },
};

export const AdminPanel = () => {

  

  return (
    <Admin basename="/admin" loginPage={CustomLoginPage} authProvider={authProvider} requireAuth dataProvider={dataProvider}>
      
      {(permissions) => (
        
        <>
        
        {(permissions.includes('ADMIN') || permissions.includes('superadmin')) && (
          <Resource 
            name="produto"
            list={ProdutoList}
            edit={ProdutoEdit}
            create={ProdutoCreate}
          />
        )}
      </>
      )}
    </Admin>
  );
}
