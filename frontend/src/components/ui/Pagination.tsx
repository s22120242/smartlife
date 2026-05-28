interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages: (number | string)[] = []
    const delta = 2

    pages.push(1)

    if (page - delta > 2) {
      pages.push('...')
    }

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      pages.push(i)
    }

    if (page + delta < totalPages - 1) {
      pages.push('...')
    }

    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2.5 min-w-[44px] min-h-[44px] rounded-lg text-sm font-medium transition-colors bg-surface text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Anterior
      </button>

      {getPages().map((p, i) =>
        typeof p === 'string' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-500 min-w-[44px] min-h-[44px] flex items-center justify-center">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[44px] min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-primary text-white'
                : 'bg-surface text-gray-400 hover:text-white'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2.5 min-w-[44px] min-h-[44px] rounded-lg text-sm font-medium transition-colors bg-surface text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  )
}
