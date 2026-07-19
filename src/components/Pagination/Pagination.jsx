import "./Pagination.css";

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination" aria-label="Pagination">
      <button type="button" className="secondary-button" disabled={pagination.page === 1} onClick={() => onPageChange(pagination.page - 1)}>
        Previous
      </button>
      <span>Page {pagination.page} of {pagination.totalPages}</span>
      <button type="button" className="secondary-button" disabled={pagination.page === pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)}>
        Next
      </button>
    </div>
  );
}

export default Pagination;
