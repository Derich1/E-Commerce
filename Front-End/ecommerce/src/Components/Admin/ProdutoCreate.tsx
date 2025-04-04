import { 
  Create, 
  SimpleForm, 
  TextInput, 
  NumberInput,
  BooleanInput,
  required,
  minValue
} from "react-admin";

export const ProdutoCreate = () => (
  <Create>
    <SimpleForm>
      {/* Campos de Texto */}
      <TextInput source="nome" validate={required()} fullWidth />
      <TextInput source="imagemUrl" validate={required()} fullWidth />
      <TextInput source="marca" validate={required()} fullWidth />
      <TextInput source="descricao" validate={required()} multiline fullWidth />
      <TextInput source="categoria" validate={required()} fullWidth />

      {/* Campos Numéricos */}
      <NumberInput 
        source="precoEmCentavos" 
        label="Preço (em centavos)"
        validate={[required(), minValue(0)]} 
      />
      
      <NumberInput 
        source="estoque" 
        validate={[required(), minValue(0)]} 
      />

      {/* Medidas */}
      <NumberInput 
        source="width" 
        label="Largura (cm)"
        validate={[required(), minValue(0)]} 
      />
      
      <NumberInput 
        source="height" 
        label="Altura (cm)"
        validate={[required(), minValue(0)]} 
      />
      
      <NumberInput 
        source="length" 
        label="Comprimento (cm)"
        validate={[required(), minValue(0)]} 
      />
      
      <NumberInput 
        source="weight" 
        label="Peso (kg)"
        validate={[required(), minValue(0)]} 
        step={0.1}
      />

      {/* Campo Booleano */}
      <BooleanInput 
        source="ativo" 
        label="Disponível?"
        defaultValue={true}
        validate={required()} 
      />
    </SimpleForm>
  </Create>
);