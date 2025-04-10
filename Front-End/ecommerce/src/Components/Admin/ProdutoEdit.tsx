import { Edit, SimpleForm, TextInput, NumberInput } from "react-admin";

export const ProdutoEdit = () => {
    return (
        <Edit>
            <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="nome" />
            <NumberInput source="precoEmCentavos" />
            <TextInput source="estoque" />
            </SimpleForm>
        </Edit>
    )
};
