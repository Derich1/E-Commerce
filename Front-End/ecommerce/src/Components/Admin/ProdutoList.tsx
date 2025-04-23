import { List, Datagrid, TextField, EditButton, DeleteButton, FunctionField } from "react-admin";

export const ProdutoList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="nome" />
      <TextField source="precoEmCentavos" label="Preço (centavos)" />
      <FunctionField
        label="Desconto (%)"
        render={record =>
          record.precoEmCentavos && record.promotionalPrice
            ? `${Math.round(
                (1 - record.promotionalPrice / record.precoEmCentavos) * 100
              )}%`
            : '-'
        }
      />
      <TextField source="estoque" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
