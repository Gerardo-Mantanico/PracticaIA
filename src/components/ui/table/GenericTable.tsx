import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "./index";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import Pagination from "../../tables/Pagination";

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function GenericTable<T extends { id: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  actions,
  onRowClick,
  pagination
}: Readonly<GenericTableProps<T>>) {
  const getColumnKey = (col: Column<T>) => {
    if (col.accessorKey) return String(col.accessorKey);
    if (typeof col.header === "string") return col.header;
    if (col.className) return col.className;
    return "column";
  };

  const renderCellContent = (row: T, col: Column<T>) => {
    if (col.cell) {
      return col.cell(row);
    }
    if (col.accessorKey) {
      return row[col.accessorKey] as React.ReactNode;
    }
    return null;
  };

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-full">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/5">
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={`header-${getColumnKey(col)}`}
                  isHeader
                  className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${col.className || ''}`}
                >
                  {col.header}
                </TableCell>
              ))}
              {(onEdit || onDelete || actions) && (
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {data.map((row) => (
              <TableRow
                key={row.id}
                className={`hover:bg-gray-50 dark:hover:bg-white/5 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <TableCell
                    key={`cell-${row.id}-${getColumnKey(col)}`}
                    className={`px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 ${col.className || ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {renderCellContent(row, col)}
                  </TableCell>
                ))}
                {(onEdit || onDelete || actions) && (
                  <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2 justify-end">
                      {actions?.(row)}
                      {onEdit && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(row);
                          }}
                          className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete(row);
                          }}
                          className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <div className="flex justify-end p-4 border-t border-gray-100 dark:border-white/5">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
