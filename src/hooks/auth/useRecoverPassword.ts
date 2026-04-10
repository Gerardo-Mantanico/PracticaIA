import { useState } from "react";
import authService from "../../service/auth.service";

export function useRecoverPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recoverPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.recoverPassword(email);
      return true;
    } catch (e: any) {
      setError(e?.data?.message || e?.message || "Error al recuperar contraseña");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { recoverPassword, loading, error };
}