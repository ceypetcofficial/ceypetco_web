const Pagination = ({ page, totalPages, total, pageSize = 10, currentCount, onPageChange }) => {
  if (totalPages <= 1 && total === 0) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white rounded-b-xl">
      <p className="text-sm text-[#66767d]">
        Showing <span className="font-semibold text-[#092f3b]">{total ? (page - 1) * pageSize + 1 : 0}–{Math.min((page - 1) * pageSize + (currentCount ?? pageSize), total)}</span>{" "}
        of <span className="font-semibold text-[#092f3b]">{total}</span> {total === 1 ? "item" : "items"}
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-[#092f3b] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
        >
          Previous
        </button>
        <span className="text-sm font-semibold text-[#092f3b]">
          Page {page} of {totalPages || 1}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-[#092f3b] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
