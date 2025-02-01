
export function useAuth(): boolean {
    const token = localStorage.getItem("token");
    return !!token; // Retorna true se houver um token
  }
  