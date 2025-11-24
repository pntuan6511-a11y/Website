'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
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

interface Car {
  id: string
  name: string
  slug: string
  versions?: any[]
  images?: { id: string; imageUrl: string; imageType: string }[]
  tag?: number | null
  createdAt: string
}

const CarImage = React.memo(function CarImage({ src, alt }: { src?: string | null; alt?: string }) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-16 h-16 object-contain rounded"
      onError={() => setErrored(true)}
    />
  )
})

export default function AdminCarsPage() {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; carId: string | null }>({
    open: false,
    carId: null
  })

  useEffect(() => {
    loadCars()
  }, [])

  const loadCars = () => {
    fetch('/api/cars')
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(err => console.error(err))
  }

  const handleDeleteClick = (id: string) => {
    console.log('Opening confirm modal for car:', id)
    setConfirmModal({ open: true, carId: id })
  }

  const handleDeleteConfirm = async () => {
    const id = confirmModal.carId

    if (!id) return

    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        // Close modal first
        setConfirmModal({ open: false, carId: null })
        // Show toast after a brief delay to ensure modal is closed
        setTimeout(() => {
          console.log('Setting toast to visible')
          setToast({ visible: true, message: 'Xóa xe thành công!', variant: 'success' })
        }, 100)
        // Reload data after toast is shown
        setTimeout(() => {
          loadCars()
        }, 600)
      } else {
        setConfirmModal({ open: false, carId: null })
        setTimeout(() => {
          setToast({ visible: true, message: 'Không thể xóa xe', variant: 'error' })
        }, 100)
      }
    } catch (error) {
      setConfirmModal({ open: false, carId: null })
      setTimeout(() => {
        setToast({ visible: true, message: 'Có lỗi xảy ra', variant: 'error' })
      }, 100)
    }
  }

  const [toast, setToast] = useState({ visible: false, message: '', variant: 'info' as 'info' | 'success' | 'error' | 'warning' })

  const columns = useMemo<ColumnDef<Car>[]>(
    () => [
      {
        accessorKey: 'images',
        header: 'Hình ảnh',
        cell: ({ row }) => {
          const mainImage = row.original.images?.find(img => img.imageType === 'main')
          return <CarImage src={mainImage?.imageUrl || null} alt={row.original.name} />
        },
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Tên mẫu xe',
        cell: (info) => (
          <div className="font-medium text-gray-900 truncate" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: (info) => (
          <div className="text-gray-500">{info.getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'tag',
        header: 'Tag',
        cell: (info) => {
          const tag = info.getValue() as number | undefined
          if (!tag) return <div className="text-gray-500">-</div>
          return <div className="text-sm font-medium text-gray-700">{tag === 1 ? 'New' : tag === 2 ? 'Hot' : tag === 3 ? 'Best Sale' : '-'}</div>
        },
        enableSorting: false,
      },
      {
        accessorKey: 'versions',
        header: 'Số phiên bản',
        cell: (info) => {
          const versions = info.getValue() as any[]
          return <div className="text-center">{versions?.length || 0}</div>
        },
        enableSorting: false,
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex justify-end gap-3 items-center">
            <a href={`/admin/cars/${row.original.id}`} className="text-luxury-gold hover:text-luxury-darkGold">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /></svg>
            </a>
            <button onClick={() => handleDeleteClick(row.original.id)} className="text-red-600 hover:text-red-900">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
            </button>
          </div>
        ),
      },
    ],
    []
  )

  const filteredData = useMemo(() => cars.filter(c => {
    if (tagFilter) {
      const carTag = (c as any).tag
      return String(typeof carTag === 'undefined' || carTag === null ? '' : carTag) === tagFilter
    }
    return true
  }).filter(c => {
    if (!globalFilter) return true
    const q = globalFilter.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
  }), [cars, tagFilter, globalFilter])

  const table = useReactTable({
    data: filteredData,
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
      <ConfirmModal
        open={confirmModal.open}
        title="Xác nhận xóa xe"
        description="Bạn có chắc muốn xóa xe này? Thao tác này không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmModal({ open: false, carId: null })}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Quản lý xe</h1>
        <a href="/admin/cars/create" className="btn-primary">
          + Thêm xe mới
        </a>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm xe..."
            className="input-custom max-w-sm"
          />

        </div>
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
                        width: index === 0 ? '10%' : index === 1 ? '30%' : index === 2 ? '20%' : index === 3 ? '15%' : '25%'
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            trong tổng số {table.getFilteredRowModel().rows.length} xe
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
