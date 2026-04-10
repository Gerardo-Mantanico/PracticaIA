"use client";
import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { profileApi } from "@/service/profile.service";

interface ProfileData {
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  ocupacion: string;
  nivelEducativo: string;
  direccion: string;
  personaContacto: string;
  parentesco: string;
  telefonoContacto: string;
}

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileData>({
    fechaNacimiento: "",
    genero: "",
    estadoCivil: "",
    ocupacion: "",
    nivelEducativo: "",
    direccion: "",
    personaContacto: "",
    parentesco: "",
    telefonoContacto: ""
  });

  // Determinar si estamos creando o editando
  const isCreating = !profileData || Object.values(profileData).every(val => !val);

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await profileApi.getCurrentUser();
        setProfileData(data);
        setFormData(data);
        setError(null);
      } catch {
        setError("No se pudo cargar la información del perfil");
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    
    try {
      setIsSaving(true);
      
      if (isCreating) {
        await profileApi.createCurrentProfile(formData);
      } else {
        await profileApi.updateCurrentProfile(formData);
      }
      
      // Actualizar el estado local con los datos guardados
      setProfileData(formData);
      
      // Cerrar modal con éxito
      setTimeout(() => {
        handleCloseModal();
      }, 500);
    } catch (err) {
      let errorMessage = "Error al guardar la información. Intenta de nuevo.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorObj = err as { response: { data: { message: string } } };
        errorMessage = errorObj.response?.data?.message || errorMessage;
      }
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setSaveError(null);
    closeModal();
  };

  if (isLoading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-gray-500 dark:text-gray-400">Cargando información...</div>
        </div>
      </div>
    );
  }

  // Si hay error en la carga, mostrar mensaje de error
  if (error && error !== "No se pudo cargar la información del perfil") {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <div className="text-red-500 dark:text-red-400">Error: {error}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Verifica que el endpoint /infoPaciente/me esté funcionando
          </div>
        </div>
      </div>
    );
  }

  // Si no existe información del perfil, mostrar botón para agregar
  if (!profileData || Object.values(profileData).every(val => !val)) {
    return (
      <>
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="flex flex-col items-center justify-center h-48 gap-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Información Personal Adicional
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Aún no has agregado tu información personal adicional. Haz clic en el botón de abajo para completarla.
            </p>
            <button
              onClick={openModal}
              className="flex items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 hover:border-blue-700 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9 1.5C5.02 1.5 1.74 4.71 1.74 8.64C1.74 12.57 5.02 15.78 9 15.78C12.98 15.78 16.26 12.57 16.26 8.64C16.26 4.71 12.98 1.5 9 1.5ZM9 14.31C5.83 14.31 3.22 11.73 3.22 8.64C3.22 5.55 5.83 2.97 9 2.97C12.17 2.97 14.78 5.55 14.78 8.64C14.78 11.73 12.17 14.31 9 14.31Z" />
                <path d="M12.375 8.25H9.75V5.625C9.75 5.39062 9.55938 5.25 9.375 5.25C9.16875 5.25 9 5.39062 9 5.625V8.25H6.375C6.14062 8.25 6 8.44062 6 8.625C6 8.83125 6.14062 9 6.375 9H9V11.625C9 11.8594 9.16875 12 9.375 12C9.55938 12 9.75 11.8594 9.75 11.625V9H12.375C12.6094 9 12.75 8.83125 12.75 8.625C12.75 8.44062 12.6094 8.25 12.375 8.25Z" />
              </svg>
              Agregar Información
            </button>
          </div>
        </div>

        {/* Modal para agregar información */}
        <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[700px] m-4">
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Agregar Información Personal
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Completa los siguientes campos con tu información personal.
              </p>
              
              {/* Mensaje de error */}
              {saveError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    <strong>Error:</strong> {saveError}
                  </p>
                </div>
              )}
            </div>
            <form className="flex flex-col" onSubmit={handleSave}>
              <div className="px-2 overflow-y-auto custom-scrollbar h-[500px]">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Dirección</Label>
                    <Input 
                      type="text" 
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Fecha de Nacimiento</Label>
                    <Input 
                      type="date" 
                      value={formData.fechaNacimiento}
                      onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    />
                  </div>
                   <div className="col-span-2 lg:col-span-1">
                    <Label>Ocupación</Label>
                    <Input 
                      type="text" 
                      value={formData.ocupacion}
                      onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Género</Label>
                    <select
                      value={formData.genero}
                      onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Estado Civil</Label>
                    <select
                      value={formData.estadoCivil}
                      onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Soltero">Soltero</option>
                      <option value="Casado">Casado</option>
                      <option value="Divorciado">Divorciado</option>
                      <option value="Viudo">Viudo</option>
                    </select>
                  </div>

                 

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nivel Educativo</Label>
                    <select
                      value={formData.nivelEducativo}
                      onChange={(e) => setFormData({ ...formData, nivelEducativo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Primaria">Primaria</option>
                      <option value="Secundaria">Secundaria</option>
                      <option value="Bachillerato">Bachillerato</option>
                      <option value="Licenciatura">Licenciatura</option>
                      <option value="Posgrado">Posgrado</option>
                    </select>
                  </div>
                    <div className="col-span-2 lg:col-span-1">
                    <Label>Parentesco</Label>
                    <select
                      value={formData.parentesco}
                      onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Hermano">Hermano</option>
                      <option value="Hermana">Hermana</option>
                      <option value="Esposo">Esposo</option>
                      <option value="Esposa">Esposa</option>
                      <option value="Hijo">Hijo</option>
                      <option value="Hija">Hija</option>
                      <option value="Amigo">Amigo</option>
                    </select>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Persona de Contacto</Label>
                    <Input 
                      type="text" 
                      value={formData.personaContacto}
                      onChange={(e) => setFormData({ ...formData, personaContacto: e.target.value })}
                    />
                  </div>
                       <div className="col-span-2 lg:col-span-1">
                    <Label>Teléfono de Contacto</Label>
                    <Input 
                      type="tel" 
                      value={formData.telefonoContacto}
                      onChange={(e) => setFormData({ ...formData, telefonoContacto: e.target.value })}
                    />
                  </div>
                
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isSaving ? "Guardando..." : "Guardar Información"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Información Personal Adicional
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-3 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Fecha de Nacimiento
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profileData.fechaNacimiento || "-"}
                </p>
              </div>

              <div>
                <p className="mb-3 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Género
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profileData.genero || "-"}
                </p>
              </div>

              <div>
                <p className="mb-3 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Estado Civil
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profileData.estadoCivil || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Ocupación
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profileData.ocupacion || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Nivel Educativo
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profileData.nivelEducativo || "-"}
                </p>
              </div>
                <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Teléfono de Contacto
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profileData.telefonoContacto || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Dirección
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profileData.direccion || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Persona de Contacto
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profileData.personaContacto || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Parentesco
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profileData.parentesco || "-"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Información Personal
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Actualiza tus detalles para mantener tu perfil al día.
            </p>
            
            {/* Mensaje de error */}
            {saveError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Error:</strong> {saveError}
                </p>
              </div>
            )}
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
              <div className="px-2 overflow-y-auto custom-scrollbar h-[500px]">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Dirección</Label>
                    <Input 
                      type="text" 
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Fecha de Nacimiento</Label>
                    <Input 
                      type="date" 
                      value={formData.fechaNacimiento}
                      onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    />
                  </div>
                   <div className="col-span-2 lg:col-span-1">
                    <Label>Ocupación</Label>
                    <Input 
                      type="text" 
                      value={formData.ocupacion}
                      onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Género</Label>
                    <select
                      value={formData.genero}
                      onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Estado Civil</Label>
                    <select
                      value={formData.estadoCivil}
                      onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Soltero">Soltero</option>
                      <option value="Casado">Casado</option>
                      <option value="Divorciado">Divorciado</option>
                      <option value="Viudo">Viudo</option>
                    </select>
                  </div>

                 

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nivel Educativo</Label>
                    <select
                      value={formData.nivelEducativo}
                      onChange={(e) => setFormData({ ...formData, nivelEducativo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Primaria">Primaria</option>
                      <option value="Secundaria">Secundaria</option>
                      <option value="Bachillerato">Bachillerato</option>
                      <option value="Licenciatura">Licenciatura</option>
                      <option value="Posgrado">Posgrado</option>
                    </select>
                  </div>
                    <div className="col-span-2 lg:col-span-1">
                    <Label>Parentesco</Label>
                    <select
                      value={formData.parentesco}
                      onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Hermano">Hermano</option>
                      <option value="Hermana">Hermana</option>
                      <option value="Esposo">Esposo</option>
                      <option value="Esposa">Esposa</option>
                      <option value="Hijo">Hijo</option>
                      <option value="Hija">Hija</option>
                      <option value="Amigo">Amigo</option>
                    </select>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Persona de Contacto</Label>
                    <Input 
                      type="text" 
                      value={formData.personaContacto}
                      onChange={(e) => setFormData({ ...formData, personaContacto: e.target.value })}
                    />
                  </div>
                       <div className="col-span-2 lg:col-span-1">
                    <Label>Teléfono de Contacto</Label>
                    <Input 
                      type="tel" 
                      value={formData.telefonoContacto}
                      onChange={(e) => setFormData({ ...formData, telefonoContacto: e.target.value })}
                    />
                  </div>
                
                </div>
              </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
