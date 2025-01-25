import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import "./index.css"
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface FormData {
  name: string;
  cpf: string;
  datanascimento: string;
  telefone: string;
  email: string;
  password: string;
}

export default function Perfil() {
  const [isLogado, setIsLogado] = useState(false)
  const Navigate = useNavigate()

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    try {
      const response = await axios.post("http://localhost:8081/cliente/cadastrar", data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      console.log(response.data)
      Navigate("/")
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error.response?.data || error.message);
    }
  }

  const schema = z.object({
    name: z.string().nonempty("O nome é obrigatório"),
    cpf: z
      .string()
      .nonempty("O CPF é obrigatório")
      .refine((value) => /^\d{11}$/.test(value), {
        message: "O CPF deve conter 11 dígitos numéricos",
      }),
    datanascimento: z
      .string()
      .nonempty("A data de nascimento é obrigatória")
      .refine((value) => /^\d{2}\/\d{2}\/\d{4}$/.test(value), {
        message: "A data deve estar no formato DD/MM/YYYY",
      }),
    telefone: z
      .string()
      .nonempty("O telefone é obrigatório")
      .refine((value) => /^\d{2}\s?\d{9}$/.test(value), {
        message: "O telefone deve incluir DDD seguido de 9 dígitos",
      }),
    email: z
      .string()
      .nonempty("O e-mail é obrigatório")
      .email("Digite um e-mail válido"),
    password: z
      .string()
      .nonempty("A senha é obrigatória")
      .min(6, "A senha deve conter pelo menos 6 caracteres"),
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Função para formatar a data de nascimento
  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2); // Adiciona a primeira barra
    if (value.length > 5) value = value.slice(0, 5) + "/" + value.slice(5); // Adiciona a segunda barra
    e.target.value = value.slice(0, 10); // Limita o tamanho a 10 caracteres
  }

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "") // Remove caracteres não numéricos
  
    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}` // Adiciona parênteses no DDD
    if (value.length > 9) value = value.slice(0, 9) + "-" + value.slice(9) // Adiciona o traço
  
    e.target.value = value.slice(0, 15); // Limita o tamanho a 15 caracteres
  }

  const handleCPFInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
  
    if (value.length > 3) value = value.slice(0, 3) + "." + value.slice(3) // Adiciona o primeiro ponto
    if (value.length > 6) value = value.slice(0, 7) + "." + value.slice(7) // Adiciona o segundo ponto
    if (value.length > 9) value = value.slice(0, 11) + "-" + value.slice(11) // Adiciona o traço
  
    e.target.value = value.slice(0, 14) // Limita o tamanho a 14 caracteres
  }
  

  return (
    <div>
      {isLogado ? (
        <div></div>
      ) : (
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1>Cadastrar</h1>
            <input
              type="text"
              placeholder="Nome Completo"
              className="input"
              {...register("name")}
              id="name"
            />
            {errors.name && <p>{String(errors.name.message)}</p>}
            <input
              type="text"
              placeholder="CPF"
              className="input"
              {...register("cpf")}
              id="cpf"
              onInput={handleCPFInput}
            />
            {errors.cpf && <p>{String(errors.cpf.message)}</p>}
            <input
              type="text"
              placeholder="Data de nascimento (DD/MM/YYYY)"
              className="input"
              {...register("datanascimento")}
              id="datanascimento"
              onInput={handleDateInput} // Formatação automática
            />
            {errors.datanascimento && <p>{String(errors.datanascimento.message)}</p>}
            <input
              type="text"
              placeholder="Telefone"
              className="input"
              {...register("telefone")}
              id="telefone"
              onInput={handlePhoneInput}
            />
            {errors.telefone && <p>{String(errors.telefone.message)}</p>}
            <input
              type="text"
              placeholder="E-mail"
              className="input"
              {...register("email")}
              id="email"
            />
            <input
              type="password"
              placeholder="Senha"
              className="input"
              {...register("password")}
            />
            <button type="submit">Cadastrar</button>
          </form>
        </div>
      )}
    </div>
  );
}
