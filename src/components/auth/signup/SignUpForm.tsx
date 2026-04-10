"use client";

import Link from "next/link";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import {
  CalenderIcon,
  DocsIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeCloseIcon,
  GroupIcon,
  LockIcon,
  UserIcon,
} from "@/icons";

import { useSignUp } from "./useSignUp";

export default function SignUpForm() {
  const {
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
  } = useSignUp();

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      {/* Contenido centrado */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">
              Sign Up
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-brand-500 hover:text-brand-600 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                Or
              </span>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Datos personales
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>
                      Email<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <EnvelopeIcon className="h-5 w-5" />
                      </span>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>
                      Nombre<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <UserIcon className="h-5 w-5" />
                      </span>
                      <Input
                        type="text"
                        id="firstname"
                        name="firstname"
                        placeholder="Ingresa tu nombre"
                        value={formData.firstname}
                        onChange={handleChange}
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>
                      Apellido<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <UserIcon className="h-5 w-5" />
                      </span>
                      <Input
                        type="text"
                        id="lastname"
                        name="lastname"
                        placeholder="Ingresa tu apellido"
                        value={formData.lastname}
                        onChange={handleChange}
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label>
                      Password<span className="text-error-500">*</span>
                    </Label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <LockIcon className="h-5 w-5" />
                      </span>
                      <Input
                        placeholder="Crea una contraseña segura"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-11 pr-11"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Datos académicos
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>
                      Rol<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <GroupIcon className="h-5 w-5" />
                      </span>
                      <select
                        id="roleId"
                        name="roleId"
                        value={formData.roleId}
                        onChange={handleChange}
                        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-11 pr-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        required
                      >
                        <option value="">
                          {rolesLoading ? "Cargando roles..." : "Selecciona un rol"}
                        </option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>
                      Student ID<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <DocsIcon className="h-5 w-5" />
                      </span>
                      <Input
                        type="number"
                        id="studentId"
                        name="studentId"
                        placeholder="0"
                        value={formData.studentId}
                        onChange={handleChange}
                        className="pl-11"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label>
                      Fecha de ingreso<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <CalenderIcon className="h-5 w-5" />
                      </span>
                      <Input
                        type="date"
                        id="entryDate"
                        name="entryDate"
                        value={formData.entryDate}
                        onChange={handleChange}
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              {error && (
                <p className="text-sm text-center text-error-500">{error}</p>
              )}
              {success && (
                <p className="text-sm text-center text-success-500">
                  {success}
                </p>
              )}

              {/* Button */}
              <div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
                >
                  {loading ? "Registrando..." : "Sign Up"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
