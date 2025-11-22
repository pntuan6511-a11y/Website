'use client'

import { useEffect, useState, useMemo } from 'react'
import Toast from '@/components/Toast'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'

interface Customer {
  id: string
  name: string
  imageUrl?: string
  order: number
  createdAt: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = () => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error(err))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        loadCustomers()
      }
    } catch (error) {
      setToast({ visible: true, message: 'Có lỗi xảy ra', variant: 'error' })
    }
  }

  const [toast, setToast] = useState({ visible: false, message: '', variant: 'info' as 'info' | 'success' | 'error' | 'warning' })

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Tên',
        cell: (info) => (
          <div className="font-medium text-gray-900 truncate" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'imageUrl',
        header: 'Hình ảnh',
        cell: (info) => {
          const imageUrl = info.getValue() as string
          return imageUrl ? (
            <img src={imageUrl} alt="Customer" className="w-12 h-12 rounded-full object-cover" />
          ) : null
        },
        enableSorting: false,
      },
      {
        accessorKey: 'order',
        header: 'Thứ tự',
        cell: (info) => (
          <div className="text-gray-700">{info.getValue() as number}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex justify-end gap-3">
            <a 
              href={`/admin/customers/${row.original.id}`}
              className="text-luxury-gold hover:text-luxury-darkGold font-medium"
            >
              Sửa
            </a>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="text-red-600 hover:text-red-900 font-medium"
            >
              Xóa
            </button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: customers,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div>
      <Toast message={toast.message} visible={toast.visible} variant={toast.variant} onClose={() => setToast({ ...toast, visible: false })} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
        <a href="/admin/customers/create" className="btn-primary">
          + Thêm khách hàng
        </a>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Tìm kiếm..."
          className="input-custom max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{
                        width: index === 0 ? '40%' : index === 1 ? '15%' : index === 2 ? '20%' : '25%'
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center gap-2'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {{
                                asc: '↑',
                                desc: '↓',
                              }[header.column.getIsSorted() as string] ?? '↕'}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            trong tổng số {table.getFilteredRowModel().rows.length} khách hàng
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ««
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <span className="text-sm text-gray-700">
              Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »»
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
