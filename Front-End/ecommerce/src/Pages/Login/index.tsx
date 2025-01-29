import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod"

interface FormData {
    email: string;
    password: string;
}

export default function Login(){

    const Navigate = useNavigate()

    const schema = z.object({
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

      const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
        try {
            // Enviar os dados para o backend
            const response = await axios.post("http://localhost:8081/cliente", data);
      
            // Se a autenticação for bem-sucedida, armazenar o token ou redirecionar
            if (response.status === 200) {
              // Exemplo: armazenar o token no localStorage
              localStorage.setItem("token", response.data.token);
      
              // Redirecionar para a página principal ou dashboard
              Navigate("/");
            }
          } catch (error: any) {
            // Tratar erros de autenticação ou conexão
            if (error.response && error.response.status === 401) {
              alert("E-mail ou senha incorretos.");
            } else {
              console.error("Erro ao fazer login:", error);
              alert("Ocorreu um erro. Tente novamente mais tarde.");
            }
          }
      }
    
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-12 mb-10">
              <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Acesse sua conta</h1>

              <div className="mb-6">
                  <input
                      type="text"
                      placeholder="E-mail"
                      className="input w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("email")}
                      id="email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>}
              </div>

              <div className="mb-6">
                  <input
                      type="password"
                      placeholder="Senha"
                      className="input w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("password")}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{String(errors.password.message)}</p>}
              </div>

              <button 
                  type="submit" 
                  className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                  Cadastrar
              </button>

              <div className="mt-6 text-center">
                  <Link to="/cadastro" className="text-blue-500 hover:text-blue-700">
                      Ainda não possui uma conta? Cadastre-se.
                  </Link>
              </div>
          </form>

        </>
    )
}