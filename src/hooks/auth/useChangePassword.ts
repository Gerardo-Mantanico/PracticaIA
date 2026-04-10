import { useState } from "react";
import authService from "../../service/auth.service";

export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = async (code: string, email: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.changePassword(code, email, newPassword);
      return true;
    } catch (e: any) {
      setError(e?.data?.message || e?.message || "No se pudo cambiar la contraseña");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error };
}