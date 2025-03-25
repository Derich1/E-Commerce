
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { loginSuccess, logout } from "../Redux/userSlice";
import { RootState } from "../Redux/store";

const API_URL = "http://localhost:8081/cliente/perfil";

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(loginSuccess({ token, user: response.data }));
      } catch (error: any) {
        console.error("Erro ao buscar perfil:", error);
        if (error.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    if (!user && token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token]);  

  return { user, token, loading };
};

  