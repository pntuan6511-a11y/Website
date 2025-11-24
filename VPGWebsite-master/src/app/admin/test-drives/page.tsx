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

interface TestDrive {
  id: string
  fullName: string
  phone: string
  carName: string
  testDate: string
  createdAt: string
  status?: number
}

export default function AdminTestDrivesPage() {
  const [testDrives, setTestDrives] = useState<TestDrive[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    loadTestDrives()
  }, [])

  const loadTestDrives = () => {
    fetch('/api/test-drives')
      .then(res => res.json())
      .then(data => setTestDrives(data))
      .catch(err => console.error(err))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return

    try {
      const res = await fetch(`/api/test-drives/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        loadTestDrives()
      }
    } catch (error) {
      setToast({ visible: true, message: 'Có lỗi xảy ra', variant: 'error' })
    }
  }

  const [toast, setToast] = useState({ visible: false, message: '', variant: 'info' as 'info' | 'success' | 'error' | 'warning' })

  const columns = useMemo<ColumnDef<TestDrive>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Họ tên',
        cell: (info) => (
          <div className="font-medium text-gray-900 truncate" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Số điện thoại',
        cell: (info) => (
          <div className="text-gray-700">{info.getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'carName',
        header: 'Mẫu xe',
        cell: (info) => (
          <div className="text-gray-700 truncate" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'testDate',
        header: 'Ngày lái thử',
        cell: (info) => (
          <div className="text-gray-700">
            {new Date(info.getValue() as string).toLocaleDateString('vi-VN')}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const st = row.original.status
          const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newStatus = parseInt(e.target.value)
            const statusNames = {
              1: 'Chờ xử lý',
              2: 'Đã liên hệ',
              3: 'Hoàn thành'
            }

            try {
              const res = await fetch(`/api/test-drives/${row.original.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
              })
              if (res.ok) {
                loadTestDrives()
                setToast({
                  visible: true,
                  message: `Đã cập nhật trạng thái cho khách hàng "${row.original.fullName}" thành "${statusNames[newStatus as keyof typeof statusNames]}"`,
                  variant: 'success'
                })
              }
            } catch (err) {
              setToast({ visible: true, message: 'Không thể cập nhật trạng thái', variant: 'error' })
            }
          }

          const statusStyles = {
            1: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            2: 'bg-blue-100 text-blue-700 border-blue-200',
            3: 'bg-green-100 text-green-700 border-green-200'
          }

          return (
            <div className="relative inline-block">
              <select
                defaultValue={st || 1}
                onChange={handleChange}
                className={`appearance-none px-3 py-1.5 pr-8 rounded-full text-sm font-medium cursor-pointer border transition-colors hover:opacity-80 ${statusStyles[st as keyof typeof statusStyles] || statusStyles[1]}`}
              >
                <option value={1}>Chờ xử lý</option>
                <option value={2}>Đã liên hệ</option>
                <option value={3}>Hoàn thành</option>
              </select>
              <svg className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )
        },
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button onClick={() => handleDelete(row.original.id)} className="text-red-600 hover:text-red-900">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
            </button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: testDrives,
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
      <h1 className="text-3xl font-bold mb-6">Danh sách đăng ký lái thử</h1>

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
                        width: index === 0 ? '25%' : index === 1 ? '15%' : index === 2 ? '25%' : index === 3 ? '20%' : '15%'
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
            trong tổng số {table.getFilteredRowModel().rows.length} đăng ký
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
