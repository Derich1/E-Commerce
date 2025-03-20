import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { updateUser } from "../../Redux/userSlice";

interface FormData {
  name: string;
  numeroDocumento: string;
  datanascimento: string;
  telefone: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export default function Cadastro() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  // Mensagem de erro vinda do backend
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dispatch = useDispatch()


  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    try {
      const response = await axios.post("http://localhost:8081/cliente/cadastrar", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 200) {
        const { token, id, nome, email, numeroDocumento } = response.data;
  
        // Armazena no Redux
        dispatch(updateUser({ token, user: { id, nome, email, numeroDocumento } }));
  
        // Salva no localStorage para manter login persistente
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ id, nome, email, numeroDocumento }));
  
        navigate("/");
      }
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
      numeroDocumento: z
        .string()
        .nonempty("O CPF/CNPJ é obrigatório")
        .transform((value) => value.replace(/\D/g, "")) // Remove pontos e traço antes da validação
        .refine((value) => value.length === 11 || value.length === 14, {
          message: "O CPF deve conter 11 dígitos ou o CNPJ deve conter 14 dígitos numéricos",
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

  const handleNumeroDocumentoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove tudo que não for número
    let value = e.target.value.replace(/\D/g, "");
  
    // Captura o evento nativo como InputEvent
    const inputEvent = e.nativeEvent as InputEvent;
  
    // Se o usuário pressionou backspace, mantém o valor sem reformatar
    if (inputEvent.inputType === "deleteContentBackward") {
      e.target.value = value;
      return;
    }
  
    // Se o valor tiver 11 dígitos ou menos, formata como CPF
    if (value.length <= 11) {
      if (value.length > 3) value = value.slice(0, 3) + "." + value.slice(3);
      if (value.length > 6) value = value.slice(0, 7) + "." + value.slice(7);
      if (value.length > 9) value = value.slice(0, 11) + "-" + value.slice(11);
      // Limita o tamanho a 14 caracteres (xxx.xxx.xxx-xx)
      e.target.value = value.slice(0, 14);
    } else {
      // Para CNPJ: formata como XX.XXX.XXX/XXXX-XX (total de 18 caracteres)
      // Primeiro, limita a no máximo 14 dígitos
      value = value.slice(0, 14);
      let formatted = value;
      if (formatted.length > 2) formatted = formatted.slice(0, 2) + "." + formatted.slice(2);
      if (formatted.length > 6) formatted = formatted.slice(0, 6) + "." + formatted.slice(6);
      if (formatted.length > 10) formatted = formatted.slice(0, 10) + "/" + formatted.slice(10);
      if (formatted.length > 15) formatted = formatted.slice(0, 15) + "-" + formatted.slice(15);
      // Limita o resultado a 18 caracteres: 14 dígitos + 4 caracteres de formatação
      e.target.value = formatted.slice(0, 18);
    }
  };
   
  

  return (
      <div className="my-10 max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="mb-10">
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
                      placeholder="CPF/CNPJ"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("numeroDocumento")}
                      id="numeroDocumento"
                      onInput={handleNumeroDocumentoInput}
                  />
                  {errors.numeroDocumento && <p className="text-red-500 text-sm mt-1">{String(errors.numeroDocumento.message)}</p>}
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

              <div className="mb-6 relative">
                  <input
                      type={showPassword ? "text" : "password"}
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
                    {showPassword ? <BiSolidShow /> : <BiSolidHide />}
                  </button>
              </div>

              <div className="mb-6 relative">
                  <input
                      type={showPasswordConfirm ? "text" : "password"}
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
                    {showPasswordConfirm ? <BiSolidShow /> : <BiSolidHide />}
                  </button>
              </div>

              <button 
                  type="submit" 
                  className="cursor-pointer w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                  Cadastrar
              </button>
          </form>
          <div className="-mt-6">
            <Link to="/login" className="text-blue-500 hover:text-blue-700 text-center">
              Já possui conta? Faça o login
            </Link>
          </div>
    </div>
)}
