"use client";

import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
  searchText?: string;
}

interface AsyncSearchableSelectProps {
  placeholder?: string;
  onChange: (value: string) => void;
  value?: string;
  className?: string;
  label?: string;
  searchPlaceholder?: string;
  searchEndpoint: string; // URL del endpoint de búsqueda
  minChars?: number; // Mínimo de caracteres para buscar
  debounceMs?: number; // Tiempo de espera antes de buscar
  formatOption?: (item: any) => Option; // Función para formatear los resultados
}

export default function AsyncSearchableSelect({
  placeholder = "Seleccione una opción",
  onChange,
  value = "",
  className = "",
  label,
  searchPlaceholder = "Buscar...",
  searchEndpoint,
  minChars = 2,
  debounceMs = 300,
  formatOption,
}: AsyncSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Actualizar el label seleccionado cuando cambia el value
  useEffect(() => {
    if (value && options.length > 0) {
      const selected = options.find((opt) => opt.value === value);
      if (selected) {
        setSelectedLabel(selected.label);
      }
    } else if (!value) {
      setSelectedLabel("");
    }
  }, [value, options]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Realizar búsqueda con debounce
  useEffect(() => {
    const search = async () => {
      if (searchTerm.trim().length < minChars) {
        setOptions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Detectar si es un número (DPI) o texto (nombre)
        const searchValue = searchTerm.trim();
        const isNumeric = /^\d+$/.test(searchValue);
        
        // Construir URL con parámetros apropiados
        const params = new URLSearchParams();
        if (isNumeric) {
          params.append('dpi', searchValue);
        } else {
          params.append('name', searchValue);
        }

        const response = await fetch(
          `${searchEndpoint}?${params.toString()}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Formatear opciones si se proporciona la función
        const formattedOptions = formatOption 
          ? data.map(formatOption)
          : data.map((item: any) => ({
              value: String(item.id),
              label: item.name || item.firstname + " " + item.lastname || String(item.id),
            }));

        setOptions(formattedOptions);
      } catch (err) {
        console.error("Error al buscar:", err);
        setError("Error al realizar la búsqueda");
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, searchEndpoint, minChars, debounceMs, formatOption]);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSelectedLabel(option.label);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange("");
    setSelectedLabel("");
    setSearchTerm("");
    setOptions([]);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Campo de selección */}
      <div
        className={`flex items-center justify-between h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs cursor-pointer dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${
          isOpen ? "ring-3 ring-brand-500/10 border-brand-300" : ""
        }`}
        onClick={handleOpen}
      >
        <span className={selectedLabel ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"}>
          {selectedLabel || placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selectedLabel && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown con búsqueda */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {/* Campo de búsqueda */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm.trim().length > 0 && searchTerm.trim().length < minChars && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Escribe al menos {minChars} caracteres para buscar
              </p>
            )}
          </div>

          {/* Lista de opciones */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Buscando...
                </div>
              </div>
            ) : error ? (
              <div className="px-4 py-3 text-sm text-red-500 dark:text-red-400 text-center">
                {error}
              </div>
            ) : searchTerm.trim().length < minChars ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Escribe para buscar...
              </div>
            ) : options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.value}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    option.value === value ? "bg-brand-50 dark:bg-brand-900/20" : ""
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="text-sm text-gray-800 dark:text-white/90">
                    {option.label}
                  </div>
                  {option.searchText && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.searchText}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
