"use client";

import React from "react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-semibold mb-2">Acceso denegado</h1>
        <p className="text-sm text-gray-600 mb-6">No tienes permisos para ver esta página.</p>
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
