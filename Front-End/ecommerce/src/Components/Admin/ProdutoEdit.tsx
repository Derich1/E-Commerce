import { Edit, SimpleForm, TextInput, NumberInput, FormDataConsumer, FunctionField, DateInput } from "react-admin";

export const ProdutoEdit = () => {
    return (
        <Edit>
            <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="nome" />
            <NumberInput source="precoEmCentavos" />
            <DateInput source="promotionStart" label="Início Promoção" />
            <DateInput source="promotionEnd"   label="Fim Promoção" />
            <FormDataConsumer>
                {({ formData }) => (
                    <NumberInput
                    source="promotionalPrice"
                    label="Preço Promocional"
                    validate={value => {
                        if (value == null) return undefined;
                        const originalPrice = formData.precoEmCentavos;
                        return value < originalPrice
                        ? undefined
                        : 'Deve ser menor que o preço original';
                    }}
                    />
                )}
            </FormDataConsumer>


            {/* mostra em tempo real no form */}
            <FormDataConsumer>
                {({ formData, ...rest }) =>
                formData.precoEmCentavos != null &&
                formData.promotionalPrice != null ? (
                    <FunctionField
                    {...rest}
                    label="Desconto Aplicado"
                    render={() =>
                        `${Math.round(
                        (1 - formData.promotionalPrice / formData.precoEmCentavos) * 100
                        )}%`
                    }
                    />
                ) : null
                }
            </FormDataConsumer>
            <TextInput source="estoque" />
            </SimpleForm>
        </Edit>
    )
};
