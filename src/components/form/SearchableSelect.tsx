"use client";

import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
  searchText?: string; // Texto adicional para búsqueda (ej: DPI)
}

interface SearchableSelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  value?: string;
  className?: string;
  label?: string;
  searchPlaceholder?: string;
}

export default function SearchableSelect({
  options,
  placeholder = "Seleccione una opción",
  onChange,
  value = "",
  className = "",
  label,
  searchPlaceholder = "Buscar...",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Actualizar el label seleccionado cuando cambia el value
  useEffect(() => {
    if (value) {
      const selected = options.find((opt) => opt.value === value);
      setSelectedLabel(selected?.label || "");
    } else {
      setSelectedLabel("");
    }
  }, [value, options]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = searchTerm.trim() === "" 
    ? options // Si no hay búsqueda, mostrar todas las opciones
    : options.filter((option) => {
        const searchLower = searchTerm.toLowerCase();
        const labelMatch = option.label.toLowerCase().includes(searchLower);
        const searchTextMatch = option.searchText?.toLowerCase().includes(searchLower);
        return labelMatch || searchTextMatch;
      });

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
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
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
          </div>

          {/* Lista de opciones */}
          <div className="max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Cargando opciones...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
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
