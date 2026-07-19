import { useEffect, useState } from "react";
import {
  createCompany,
  deleteCompany,
  getCompanies,
  updateCompany,
} from "../../services/company.service";
import Pagination from "../../components/Pagination/Pagination";
import "./Companies.css";

const emptyForm = {
  name: "",
  country: "",
  contactEmail: "",
  phone: "",
};

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies(page = 1) {
    try {
      setLoading(true);
      setError("");
      const response = await getCompanies(page);
      setCompanies(response.data.data);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load companies.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const data = {
        ...form,
        phone: form.phone || undefined,
      };

      if (editingId) {
        await updateCompany(editingId, data);
      } else {
        await createCompany(data);
      }

      resetForm();
      await loadCompanies(editingId ? pagination?.page : 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save company.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(company) {
    setForm({
      name: company.name,
      country: company.country,
      contactEmail: company.contactEmail,
      phone: company.phone || "",
    });
    setEditingId(company.id);
    setError("");
  }

  async function handleDelete(company) {
    const fleetCount = company._count?.fleets || 0;
    const shipCount = company._count?.ships || 0;
    const confirmed = window.confirm(
      `Delete ${company.name}? This permanently deletes ${fleetCount} fleet(s) and ${shipCount} ship(s). This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await deleteCompany(company.id);

      if (editingId === company.id) {
        resetForm();
      }

      await loadCompanies(companies.length === 1 && pagination?.page > 1 ? pagination.page - 1 : pagination?.page);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete company.");
    }
  }

  return (
    <main className="companies-page">
      <section className="companies-header">
        <div>
          <p className="eyebrow">ShipOps</p>
          <h1>Companies</h1>
          <p>Manage the companies that own and operate your fleets.</p>
        </div>
      </section>

      <section className="company-form-card">
        <h2>{editingId ? "Edit company" : "Add company"}</h2>

        <form onSubmit={handleSubmit} className="company-form">
          <label>
            Company name
            <input name="name" value={form.name} onChange={handleChange} minLength="2" required />
          </label>

          <label>
            Country
            <input name="country" value={form.country} onChange={handleChange} minLength="2" required />
          </label>

          <label>
            Contact email
            <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} required />
          </label>

          <label>
            Phone <span>(optional)</span>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Save changes" : "Add company"}
            </button>
            {editingId && (
              <button type="button" className="secondary-button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {error && <p className="error-message">{error}</p>}

      <section className="company-list-card">
        <div className="list-heading">
          <h2>All companies</h2>
          <span>{pagination?.total || 0}</span>
        </div>

        {loading ? (
          <p>Loading companies...</p>
        ) : companies.length === 0 ? (
          <p>No companies yet. Add your first company above.</p>
        ) : (
          <div className="company-list">
            {companies.map((company) => (
              <article className="company-row" key={company.id}>
                <div>
                  <h3>{company.name}</h3>
                  <p>{company.country} · {company.contactEmail}</p>
                  {company.phone && <p>{company.phone}</p>}
                </div>
                <div className="row-actions">
                  <button type="button" className="secondary-button" onClick={() => handleEdit(company)}>
                    Edit
                  </button>
                  <button type="button" className="danger-button" onClick={() => handleDelete(company)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={loadCompanies} />
      </section>
    </main>
  );
}

export default Companies;
