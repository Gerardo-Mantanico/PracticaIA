"use client";

import React, { useEffect, useState } from 'react';
import { GenericTable, Column } from '@/components/ui/table/GenericTable';
import { GenericModal } from '@/components/ui/modal/GenericModal';
import Button from '@/components/ui/button/Button';
import Alert from '@/components/ui/alert/Alert';

interface AlertState {
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface GenericCatalogProps<T> {
  title: string;
  items?: T[];
  fetchItems: () => Promise<unknown>;
  deleteItem: (id: number) => Promise<unknown>;
  FormComponent?: React.ComponentType<{
    initial?: Partial<T>;
    onSaved?: () => void;
    onCancel?: () => void;
  }>;
  children?: React.ReactNode;
  columns: Column<T>[];
  itemName?: string;
  itemsPerPage?: number;
  modalSize?: 'sm' | 'md' | 'lg';
}

export function GenericPage<T extends { id: string | number }>(
  props: Readonly<GenericCatalogProps<T>>
) {
  const {
    title,
    items,
    fetchItems,
    deleteItem,
    FormComponent,
    children,
    columns,
    itemName = 'Elemento',
    itemsPerPage = 10,
    modalSize = 'sm',
  } = props;

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [alertData, setAlertData] = useState<AlertState | null>(null);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageData = (items || []).slice(startIndex, startIndex + itemsPerPage);

  /* ======================
     Helpers
  ======================= */

  const showAlert = (alert: AlertState, timeout = 3000) => {
    setAlertData(alert);
    setTimeout(() => setAlertData(null), timeout);
  };

  /* ======================
     Actions
  ======================= */

  const handleEdit = (row: T) => {
    setEditing(row);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSaved = async () => {
    const isEdit = Boolean(editing);

    setIsModalOpen(false);
    setEditing(null);
    await fetchItems();

    showAlert({
      variant: 'success',
      title: isEdit ? `${itemName} actualizada` : `${itemName} creada`,
      message: isEdit
        ? `${itemName} actualizada correctamente.`
        : `${itemName} creada correctamente.`,
    });
  };

  /* ======================
     Render
  ======================= */

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>

        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setIsModalOpen(true);
          }}
        >
          Agregar {itemName}
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
        {/* Alerts */}
        {alertData && (
          <div className="mb-4">
            <Alert
              variant={alertData.variant}
              title={alertData.title}
              message={alertData.message}
              dismissible
              autoHide={3000}
              onClose={() => setAlertData(null)}
            />
          </div>
        )}

        {/* Table */}
        <GenericTable
          data={pageData}
          columns={columns}
          onEdit={handleEdit}
          onDelete={async (row) => {
            try {
              await deleteItem(Number(row.id));
              await fetchItems();

              showAlert({
                variant: 'success',
                title: `${itemName} eliminada`,
                message: `${itemName} eliminada correctamente.`,
              });
            } catch (err) {
              console.error(err);
              showAlert(
                {
                  variant: 'error',
                  title: 'Error',
                  message: `Error al eliminar la ${itemName.toLowerCase()}.`,
                },
                5000
              );
            }
          }}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
          }}
        />

        {/* Modal */}
        <GenericModal
          isOpen={isModalOpen}
          onClose={handleCancel}
          title={editing ? `Editar ${itemName}` : `Nuevo ${itemName}`}
          size={modalSize}
        >
          {(() => {
            if (children) {
              return React.Children.map(children, (child) =>
                React.isValidElement(child)
                  ? React.cloneElement(
                      child as React.ReactElement<Record<string, unknown>>,
                      {
                        initial: editing || undefined,
                        onCancel: handleCancel,
                        onSaved: handleSaved,
                      }
                    )
                  : child
              );
            }

            if (FormComponent) {
              return (
                <FormComponent
                  initial={editing || undefined}
                  onCancel={handleCancel}
                  onSaved={handleSaved}
                />
              );
            }

            return null;
          })()}
        </GenericModal>
      </div>
    </div>
  );
}

export default GenericPage;
