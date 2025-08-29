import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Loader,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '~/lib/utils';
import type { prismaModelField } from '~/types';
import { Badge } from './badge';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from './pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export type DataTableProps<T> = {
  data: T[];
  className?: string;
  modelName?: string;
  modelFields?: prismaModelField[];
  pagination?: {
    totalCount: number;
    page: number;
    take: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
  onTakeChange?: (take: number) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  isSearchDisabled?: boolean;
  onBulkDelete?: (ids: string[]) => void;
  onSingleDelete?: (id: string) => void;
  onSelectionReset?: () => void;
  renderRowActions?: (row: T) => React.ReactNode;
};

export function DataTable<T extends Record<string, any>>({
  data,
  className,
  modelName,
  modelFields,
  pagination,
  onPageChange,
  onTakeChange,
  search,
  onSearchChange,
  isSearchDisabled = false,
  onBulkDelete,
  onSingleDelete,
  onSelectionReset,
  renderRowActions,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filters] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [showLoader, setShowLoader] = useState(false);
  const loaderTimeout = useRef<NodeJS.Timeout | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const idKey = data && data.length > 0 ? Object.keys(data[0])[0] : 'id';
  const allIds = data.map((row) => String(row[idKey]));
  const allSelected = selected.length === allIds.length && allIds.length > 0;
  const isIndeterminate =
    selected.length > 0 && selected.length < allIds.length;
  const selectAllRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isPending) {
      if (loaderTimeout.current) clearTimeout(loaderTimeout.current);
      setShowLoader(true);
    } else if (showLoader) {
      loaderTimeout.current = setTimeout(() => {
        setShowLoader(false);
      }, 1000);
    }
    return () => {
      if (loaderTimeout.current) clearTimeout(loaderTimeout.current);
    };
  }, [isPending]);

  // Infer columns from data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Filter and sort logic (no search here, handled by server)
  const filteredData = useMemo(() => {
    let filtered = data;
    // Per-column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          String(row[key] ?? '')
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      }
    });
    // Sorting
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue === bValue) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return sortDir === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    return filtered;
  }, [data, filters, sortKey, sortDir, columns]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Move pagination handlers inside
  const handlePageChange = (page: number) => {
    if (
      pagination &&
      page >= 1 &&
      page <= pagination.totalPages &&
      onPageChange
    ) {
      startTransition(() => {
        onPageChange(page);
      });
    }
  };
  const handleTakeChange = (take: number) => {
    if (onTakeChange) {
      startTransition(() => {
        onTakeChange(take);
      });
    }
  };

  const handleRowClick = (row: T, event: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = event.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    if (modelName) {
      const primaryKey = String(row[idKey]);
      navigate(`/models/${modelName}/${primaryKey}`);
    }
  };

  useEffect(() => {
    if (selectAllRef.current) {
      // Find the input element inside the Radix Checkbox button
      const input = selectAllRef.current.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement | null;
      if (input) input.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  // Reset selection when data changes (after deletion)
  useEffect(() => {
    if (selected.length > 0) {
      setSelected([]);
      onSelectionReset?.();
    }
  }, [data, onSelectionReset]);

  return (
    <div
      className={cn(className, 'flex flex-col overflow-auto w-full relative')}
    >
      {' '}
      {/* root is flex column, fills parent */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 flex-shrink-0">
        {!isSearchDisabled && (
          <Input
            placeholder="Search..."
            value={search || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="max-w-xs"
            disabled={showLoader}
          />
        )}
        {/* Bulk delete bar */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm">{selected.length} selected</span>
            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onBulkDelete(selected)}
              >
                <Trash2 className="w-4 h-4 mr-1" />{' '}
                {selected.length === 1 ? 'Delete' : 'Bulk Delete'}
              </Button>
            )}
          </div>
        )}
        {showLoader && (
          <div className=" top-0 z-20 flex items-center gap-2 p-2 transition-opacity duration-1000">
            <Loader className="animate-spin w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-auto rounded border border-border">
        {' '}
        {/* scrollable area */}
        <table className="min-w-full divide-y divide-border h-full">
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              <th className="px-2 py-2 text-left">
                <Checkbox
                  ref={selectAllRef}
                  checked={allSelected}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelected(allIds);
                    } else {
                      setSelected([]);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Select all rows"
                />
              </th>
              {columns.map((key) => (
                <th
                  key={key}
                  className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none bg-muted"
                  onClick={() => handleSort(key)}
                  style={{ position: 'sticky', top: 0, background: 'inherit' }}
                >
                  <div className="flex items-center gap-1">
                    {key}
                    {sortKey === key &&
                      (sortDir === 'asc' ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      ))}
                  </div>
                </th>
              ))}
              {onSingleDelete && (
                <th
                  className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider bg-muted"
                  style={{ position: 'sticky', top: 0, background: 'inherit' }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredData.length === 0 ? (
              <tr>
                <td />
                <td
                  colSpan={columns.length + (onSingleDelete ? 1 : 0)}
                  className="text-center py-8 text-muted-foreground"
                >
                  No data found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    'hover:bg-accent/30',
                    modelName && 'cursor-pointer'
                  )}
                  onClick={(e) => handleRowClick(row, e)}
                >
                  <td className="px-2 py-2">
                    <Checkbox
                      checked={selected.includes(String(row[idKey]))}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelected((prev) => [...prev, String(row[idKey])]);
                        } else {
                          setSelected((prev) =>
                            prev.filter((id) => id !== String(row[idKey]))
                          );
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Select row"
                    />
                  </td>
                  {columns.map((key) => {
                    const value = row[key];
                    let displayValue: string;
                    if (typeof value === 'object' && value !== null) {
                      displayValue = JSON.stringify(value);
                    } else {
                      displayValue = String(value ?? '');
                    }
                    const isLong = displayValue.length > 100;
                    const shownValue = isLong
                      ? displayValue.slice(0, 100) + '…'
                      : displayValue;

                    // Find the field definition for this column
                    const fieldDef = modelFields?.find(
                      (field) => field.name === key
                    );

                    let cellContent;
                    if (
                      typeof value === 'string' &&
                      value.startsWith('https://')
                    ) {
                      cellContent = (
                        <Link
                          to={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 underline hover:text-blue-500 duration-300 transition-all underline-offset-2"
                          title={displayValue}
                        >
                          {shownValue}
                        </Link>
                      );
                    } else if (fieldDef?.type === 'DateTime' && value) {
                      // Handle DateTime values
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                        cellContent = (
                          <Badge variant="secondary" title={value}>
                            {formatted}
                          </Badge>
                        );
                      } else {
                        cellContent = (
                          <span title={displayValue}>{shownValue}</span>
                        );
                      }
                    } else if (
                      fieldDef?.type === 'Boolean' &&
                      typeof value === 'boolean'
                    ) {
                      // Handle Boolean values
                      cellContent = (
                        <Badge variant={value ? 'default' : 'secondary'}>
                          {value ? 'True' : 'False'}
                        </Badge>
                      );
                    } else if (fieldDef?.type === 'Json' && value) {
                      // Handle JSON values
                      const jsonStr =
                        typeof value === 'string'
                          ? value
                          : JSON.stringify(value);
                      const isLong = jsonStr.length > 50;
                      const shownJson = isLong
                        ? jsonStr.slice(0, 50) + '…'
                        : jsonStr;
                      cellContent = (
                        <span title={jsonStr} className="font-mono text-xs">
                          {shownJson}
                        </span>
                      );
                    } else if (value instanceof Date) {
                      // Fallback for actual Date objects
                      const formatted = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')} ${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
                      cellContent = (
                        <Badge variant="secondary" title={value.toISOString()}>
                          {formatted}
                        </Badge>
                      );
                    } else {
                      cellContent = (
                        <span title={displayValue}>{shownValue}</span>
                      );
                    }
                    return (
                      <td
                        key={key}
                        className="px-4 py-2 whitespace-nowrap text-sm max-w-[400px] overflow-hidden text-ellipsis"
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                  {onSingleDelete && (
                    <td className="px-2 py-2 flex gap-1 items-center">
                      {renderRowActions && renderRowActions(row)}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSingleDelete(String(row[idKey]));
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination className="mt-4 mb-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                isActive={false}
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.hasPrevPage)
                    handlePageChange(pagination.page - 1);
                }}
                aria-disabled={!pagination.hasPrevPage}
                tabIndex={!pagination.hasPrevPage ? -1 : 0}
                href="#"
                style={{
                  cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                  opacity: pagination.hasPrevPage ? 1 : 0.5,
                }}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </PaginationLink>
            </PaginationItem>
            {/* Page numbers with ellipsis */}
            {(() => {
              const pages = [];
              const { page, totalPages } = pagination;
              const maxPages = 7; // show up to 7 page buttons
              if (totalPages <= maxPages) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(i);
                        }}
                        href="#"
                        style={{ cursor: 'pointer' }}
                      >
                        {i}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
              } else {
                // Always show first, last, current, and neighbors
                const showLeftEllipsis = page > 4;
                const showRightEllipsis = page < totalPages - 3;
                const pageNumbers = [];
                pageNumbers.push(1);
                if (showLeftEllipsis) {
                  pageNumbers.push('left-ellipsis');
                }
                for (
                  let i = Math.max(2, page - 1);
                  i <= Math.min(totalPages - 1, page + 1);
                  i++
                ) {
                  if (i !== 1 && i !== totalPages) pageNumbers.push(i);
                }
                if (showRightEllipsis) {
                  pageNumbers.push('right-ellipsis');
                }
                pageNumbers.push(totalPages);
                pageNumbers.forEach((p, idx) => {
                  if (p === 'left-ellipsis' || p === 'right-ellipsis') {
                    pages.push(
                      <PaginationItem key={p + idx}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  } else {
                    pages.push(
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={page === p}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(Number(p));
                          }}
                          href="#"
                          style={{ cursor: 'pointer' }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                });
              }
              return pages;
            })()}
            <PaginationItem>
              <PaginationLink
                isActive={false}
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.hasNextPage)
                    handlePageChange(pagination.page + 1);
                }}
                aria-disabled={!pagination.hasNextPage}
                tabIndex={!pagination.hasNextPage ? -1 : 0}
                href="#"
                style={{
                  cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                  opacity: pagination.hasNextPage ? 1 : 0.5,
                }}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <Select
                value={String(pagination.take)}
                onValueChange={(val) => handleTakeChange(Number(val))}
              >
                <SelectTrigger className="ml-4 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default DataTable;
