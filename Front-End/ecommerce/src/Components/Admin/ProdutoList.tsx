import { List, Datagrid, TextField, EditButton, DeleteButton } from "react-admin";

export const ProdutoList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="nome" />
      <TextField source="precoEmCentavos" label="Preço (centavos)" />
      <TextField source="estoque" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
