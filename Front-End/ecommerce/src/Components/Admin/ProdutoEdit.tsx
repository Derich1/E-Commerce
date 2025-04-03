import { Edit, SimpleForm, TextInput, NumberInput } from "react-admin";

export const ProdutoEdit = (props: any) => {
    console.log("🔍 ProdutoEdit props:", props)
    return (
        <Edit>
            <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="nome" />
            <NumberInput source="precoEmCentavos" />
            </SimpleForm>
        </Edit>
    )
};
