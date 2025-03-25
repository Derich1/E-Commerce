import { createContext, useContext, ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./Redux/store"; // Ajuste o caminho conforme necessário

interface AuthContextType {
  user: any; // Substitua por seu tipo de usuário
  token: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Busca os dados diretamente do Redux Persist
  const { user, token } = useSelector((state: RootState) => state.user);
  
  const value = {
    user,
    token,
    isAuthenticated: !!token // Verificação simples de autenticação
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}