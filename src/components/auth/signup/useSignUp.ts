"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/service/auth.service";
import roleApi from "@/service/rol.service";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

type RoleOption = {
  id: number;
  name: string;
  description?: string;
};

export function useSignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    roleId: "",
    studentId: "0",
    entryDate: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      setRolesLoading(true);

      try {
        const response = await roleApi.getAll();
        const items = Array.isArray(response) ? response : response?.content ?? response?.data ?? [];

        if (isMounted) {
          setRoles(items);
        }
      } catch {
        if (isMounted) {
          setRoles([]);
          setError("No se pudieron cargar los roles disponibles.");
        }
      } finally {
        if (isMounted) {
          setRolesLoading(false);
        }
      }
    };

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const sanitizedData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      roleId: Number.parseInt(formData.roleId, 10),
      studentId: Number.parseInt(formData.studentId, 10),
      entryDate: formData.entryDate,
    };

    if (
      !sanitizedData.email ||
      !sanitizedData.password ||
      !sanitizedData.firstname ||
      !sanitizedData.lastname ||
      !sanitizedData.entryDate
    ) {
      setError("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    if (!EMAIL_REGEX.test(sanitizedData.email)) {
      setError("Ingresa un correo válido.");
      setLoading(false);
      return;
    }

    if (!PASSWORD_REGEX.test(sanitizedData.password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.");
      setLoading(false);
      return;
    }

    if (!sanitizedData.roleId || Number.isNaN(sanitizedData.roleId) || sanitizedData.roleId < 0) {
      setError("Debes seleccionar un rol válido.");
      setLoading(false);
      return;
    }

    if (Number.isNaN(sanitizedData.studentId) || sanitizedData.studentId < 0) {
      setError("Student ID debe ser un número mayor o igual a 0.");
      setLoading(false);
      return;
    }

    const payload = {
      email: sanitizedData.email,
      password: sanitizedData.password,
      firstname: sanitizedData.firstname,
      lastname: sanitizedData.lastname,
      roleId: sanitizedData.roleId,
      studentId: sanitizedData.studentId,
      entryDate: sanitizedData.entryDate,
    };

    try {
      await authService.register(payload);

      setSuccess("Registro exitoso!");
      setTimeout(() => router.push("/signin"), 1800);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    roles,
    rolesLoading,
    handleChange,
    handleSubmit,
    loading,
    showPassword,
    setShowPassword,
    error,
    success,
  };
}
