import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";

interface FormData {
  name: string;
  cpf: string;
  datanascimento: string;
  telefone: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export default function Cadastro() {
  const [isLogado] = useState(false)
  const Navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  // Mensagem de erro vinda do backend
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    try {
      const response = await axios.post("http://localhost:8081/cliente/cadastrar", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      console.log(response.data);
  
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
  
      Navigate("/");
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error.response?.data || error.message);
  
      // Verifica se o backend retornou uma mensagem de erro e armazena no estado
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Ocorreu um erro ao cadastrar. Tente novamente.");
      }
    }
  };
  

  const schema = z
    .object({
      name: z.string().nonempty("O nome é obrigatório"),
      cpf: z
        .string()
        .nonempty("O CPF é obrigatório")
        .transform((value) => value.replace(/\D/g, "")) // Remove pontos e traço antes da validação
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
        .transform((value) => value.replace(/\D/g, "")) // Remove caracteres não numéricos
        .refine((value) => /^\d{11}$/.test(value), {
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
      passwordConfirm: z.string().nonempty("A confirmação de senha é obrigatória"),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: "As senhas devem coincidir",
      path: ["passwordConfirm"],
    });


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
    if (value.length > 10) value = value.slice(0, 10) + "-" + value.slice(10) // Adiciona o traço
  
    e.target.value = value.slice(0, 15); // Limita o tamanho a 15 caracteres
  }

  const handleCPFInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
  
    // Captura o evento nativo como InputEvent
    const inputEvent = e.nativeEvent as InputEvent;
  
    // Se o usuário pressionou backspace, mantém o valor sem reformatar
    if (inputEvent.inputType === "deleteContentBackward") {
      e.target.value = value;
      return;
    }
  
    // Formata o CPF conforme o usuário digita
    if (value.length > 3) value = value.slice(0, 3) + "." + value.slice(3);
    if (value.length > 6) value = value.slice(0, 7) + "." + value.slice(7);
    if (value.length > 9) value = value.slice(0, 11) + "-" + value.slice(11);
  
    e.target.value = value.slice(0, 14); // Limita a 14 caracteres (xxx.xxx.xxx-xx)
  };  
  

  return (
    <div>
      {isLogado ? (
        <div></div>
      ) : (
        <div className="mt-10 max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
              <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Cadastrar</h1>

              <div className="mb-4">
                  <input
                      type="text"
                      placeholder="Nome Completo"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("name")}
                      id="name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>}
              </div>

              <div className="mb-4">
                  <input
                      type="text"
                      placeholder="CPF"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("cpf")}
                      id="cpf"
                      onInput={handleCPFInput}
                  />
                  {errors.cpf && <p className="text-red-500 text-sm mt-1">{String(errors.cpf.message)}</p>}
              </div>

              <div className="mb-4">
                  <input
                      type="text"
                      placeholder="Data de nascimento (DD/MM/YYYY)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("datanascimento")}
                      id="datanascimento"
                      onInput={handleDateInput}
                  />
                  {errors.datanascimento && <p className="text-red-500 text-sm mt-1">{String(errors.datanascimento.message)}</p>}
              </div>

              <div className="mb-4">
                  <input
                      type="text"
                      placeholder="Telefone"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("telefone")}
                      id="telefone"
                      onInput={handlePhoneInput}
                  />
                  {errors.telefone && <p className="text-red-500 text-sm mt-1">{String(errors.telefone.message)}</p>}
              </div>

              <div className="mb-4">
                  <input
                      type="text"
                      placeholder="E-mail"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("email")}
                      id="email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>}
              </div>

              <div className="mb-6">
                  <input
                      type="password"
                      placeholder="Senha"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("password")}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{String(errors.password.message)}</p>}
                  {errorMessage && ( <p className="text-red-500 text-sm mt-2 text-center">{errorMessage}</p>)}
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <BiSolidHide /> : <BiSolidShow />}
                  </button>
              </div>

              <div className="mb-6">
                  <input
                      type="password"
                      placeholder="Confirme sua Senha"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("passwordConfirm")}
                  />
                  {errors.passwordConfirm && <p className="text-red-500 text-sm mt-1">{String(errors.passwordConfirm.message)}</p>}
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  >
                    {showPassword ? <BiSolidHide /> : <BiSolidShow />}
                  </button>
              </div>

              <button 
                  type="submit" 
                  className="cursor-pointer w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                  Cadastrar
              </button>
          </form>
          <Link to="/login" className="text-blue-500 hover:text-blue-700 text-center mt-10">
            Já possui conta? Faça o login
          </Link>
      </div>
      )}
    </div>
  );
}
