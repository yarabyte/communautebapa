"use client"

import { useState } from "react"
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, datetime: sortFn_datetime },
})

type Features = typeof dataTableFeatures

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableColumn<T extends RowData> = ColumnDef<Features, T, any>

export function columnHelper<T extends RowData>() {
  return createColumnHelper<Features, T>()
}

type DataTableProps<T extends RowData> = {
  columns: DataTableColumn<T>[]
  data: T[]
  searchPlaceholder?: string
  toolbar?: React.ReactNode
  pageSize?: number
  emptyLabel?: string
}

export function DataTable<T extends RowData>({ columns, data, searchPlaceholder = "Rechercher…", toolbar, pageSize = 10, emptyLabel = "Aucun résultat." }: DataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("")
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    initialState: { pagination: { pageIndex: 0, pageSize } },
  })

  const total = table.getFilteredRowModel().rows.length
  const { pageIndex } = table.state.pagination

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder={searchPlaceholder} className="bg-card pl-9" />
        </div>
        {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="bg-secondary/60 hover:bg-secondary/60">
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  const canSort = header.column.getCanSort()
                  return (
                    <TableHead key={header.id} className="first:pl-4">
                      {header.isPlaceholder ? null : canSort ? (
                        <button type="button" onClick={header.column.getToggleSortingHandler()} className="flex items-center gap-1.5 hover:text-terre">
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? <ArrowUp className="size-3.5" /> : sorted === "desc" ? <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3.5 opacity-40" />}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="first:pl-4">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>
          {total} élément{total > 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <span>
            Page {pageIndex + 1} / {Math.max(1, table.getPageCount())}
          </span>
          <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Page précédente">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Page suivante">
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}