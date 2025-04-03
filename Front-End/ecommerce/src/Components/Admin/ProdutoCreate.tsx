import { Create, SimpleForm, TextInput, NumberInput } from "react-admin";

export const ProdutoCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="nome" />
      <NumberInput source="preco" />
    </SimpleForm>
  </Create>
);
