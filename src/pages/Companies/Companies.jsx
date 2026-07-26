import { useEffect, useState } from "react";
import {
  createCompany,
  deleteCompany,
  getCompanies,
  updateCompany,
} from "../../services/company.service";
import Pagination from "../../components/Pagination/Pagination";
import { countries } from "../../constants/countries";
import { getUser } from "../../services/auth.service";
import "./Companies.css";

const emptyForm = {
  name: "",
  country: "",
  contactEmail: "",
  phone: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[\d\s().-]{7,25}$/;

function validateCompanyForm(form) {
  const fieldErrors = {};
  const phoneDigits = form.phone.replace(/\D/g, "");

  if (form.name.trim().length < 2) {
    fieldErrors.name = "Company name must be at least 2 characters.";
  }

  if (!form.country) {
    fieldErrors.country = "Please select a country.";
  }

  if (!emailPattern.test(form.contactEmail.trim())) {
    fieldErrors.contactEmail = "Enter a valid contact email address.";
  }

  if (
    form.phone.trim()
    && (!phonePattern.test(form.phone.trim()) || phoneDigits.length < 7 || phoneDigits.length > 15)
  ) {
    fieldErrors.phone = "Enter a valid phone number (7 to 15 digits).";
  }

  return fieldErrors;
}

function getServerFieldErrors(requestError) {
  const errors = requestError.response?.data?.errors;

  if (!Array.isArray(errors)) {
    return {};
  }

  return errors.reduce((fieldErrors, error) => {
    fieldErrors[error.field] = error.message;
    return fieldErrors;
  }, {});
}

function Companies() {
  const user = getUser();
  const isAdmin = user?.role === "ADMIN";
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showForm, setShowForm] = useState(false);

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
    setFieldErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFieldErrors({});
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateCompanyForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setFieldErrors({});

      const data = {
        ...form,
        name: form.name.trim(),
        contactEmail: form.contactEmail.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
      };

      if (editingId) {
        await updateCompany(editingId, data);
      } else {
        await createCompany(data);
      }

      resetForm();
      await loadCompanies(editingId ? pagination?.page : 1);
    } catch (requestError) {
      const serverFieldErrors = getServerFieldErrors(requestError);

      if (Object.keys(serverFieldErrors).length > 0) {
        setFieldErrors(serverFieldErrors);
        setError("");
      } else {
        setError(requestError.response?.data?.message || "Unable to save company.");
      }
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
    setFieldErrors({});
    setShowForm(true);
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

      {isAdmin && showForm && <section className="company-form-card">
        <h2>{editingId ? "Edit company" : "Add company"}</h2>

        <form onSubmit={handleSubmit} className="company-form" noValidate>
          <label>
            Company name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "company-name-error" : undefined}
            />
            {fieldErrors.name && <span id="company-name-error" className="field-error">{fieldErrors.name}</span>}
          </label>

          <label>
            Country
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.country)}
              aria-describedby={fieldErrors.country ? "country-error" : undefined}
            >
              <option value="">Select a country</option>
              {form.country && !countries.includes(form.country) && (
                <option value={form.country}>{form.country}</option>
              )}
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {fieldErrors.country && <span id="country-error" className="field-error">{fieldErrors.country}</span>}
          </label>

          <label>
            Contact email
            <input
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.contactEmail)}
              aria-describedby={fieldErrors.contactEmail ? "contact-email-error" : undefined}
            />
            {fieldErrors.contactEmail && <span id="contact-email-error" className="field-error">{fieldErrors.contactEmail}</span>}
          </label>

          <label>
            Phone <span>(optional)</span>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            />
            {fieldErrors.phone && <span id="phone-error" className="field-error">{fieldErrors.phone}</span>}
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
      </section>}

      {error && <p className="error-message">{error}</p>}

      <section className="company-list-card">
        <div className="list-heading">
          <div className="company-list-title">
            <h2>All companies</h2>
            <span>{pagination?.total || 0}</span>
          </div>
          {isAdmin && <button type="button" onClick={() => { resetForm(); setShowForm(true); }}>
            Add new company
          </button>}
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
                {isAdmin && <div className="row-actions">
                  <button type="button" className="secondary-button" onClick={() => handleEdit(company)}>
                    Edit
                  </button>
                  <button type="button" className="danger-button" onClick={() => handleDelete(company)}>
                    Delete
                  </button>
                </div>}
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
