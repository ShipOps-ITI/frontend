import { useEffect, useState } from "react";
import { getCompanies } from "../../services/company.service";
import {
  createFleet,
  deleteFleet,
  getFleets,
  updateFleet,
} from "../../services/fleet.service";
import { getUser } from "../../services/auth.service";
import Pagination from "../../components/Pagination/Pagination";
import "./Fleets.css";

const emptyForm = {
  companyId: "",
  name: "",
  description: "",
};

function getErrorMessage(requestError, fallbackMessage) {
  const validationError = requestError.response?.data?.errors?.[0]?.message;
  return validationError || requestError.response?.data?.message || fallbackMessage;
}

function Fleets() {
  const loggedInUser = getUser();
  const isAdmin = loggedInUser?.role === "ADMIN";
  const [fleets, setFleets] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData(page = 1) {
    try {
      setLoading(true);
      setError("");
      const [fleetResponse, companyResponse] = await Promise.all([getFleets(page), getCompanies(1, 100)]);
      setFleets(fleetResponse.data.data);
      setPagination(fleetResponse.data.pagination);
      setCompanies(companyResponse.data.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load fleets."));
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
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      if (!isAdmin && !loggedInUser?.companyId) {
        setError("Your account is not assigned to a company. Ask an administrator to assign one, then log in again.");
        return;
      }

      if (editingId) {
        await updateFleet(editingId, {
          name: form.name,
          description: form.description || undefined,
        });
      } else {
        await createFleet({
          ...(isAdmin ? { companyId: Number(form.companyId) } : {}),
          name: form.name,
          description: form.description || undefined,
        });
      }

      resetForm();
      await loadPageData(editingId ? pagination?.page : 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to save fleet."));
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(fleet) {
    setForm({
      companyId: fleet.companyId,
      name: fleet.name,
      description: fleet.description || "",
    });
    setEditingId(fleet.id);
    setError("");
    setShowForm(true);
  }

  async function handleDelete(fleet) {
    const shipCount = fleet._count?.ships || 0;
    if (shipCount > 0) {
      setError(`This fleet has ${shipCount} ship record(s). Delete the ship records first before deleting this fleet.`);
      return;
    }

    if (!window.confirm(`Delete ${fleet.name}? This cannot be undone.`)) {
      return;
    }

    try {
      setError("");
      await deleteFleet(fleet.id);

      if (editingId === fleet.id) {
        resetForm();
      }

      await loadPageData(fleets.length === 1 && pagination?.page > 1 ? pagination.page - 1 : pagination?.page);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to delete fleet."));
    }
  }

  return (
    <main className="fleets-page">
      <section className="fleets-header">
        <div>
          <p className="eyebrow">ShipOps</p>
          <h1>Fleets</h1>
          <p>Group ships into fleets owned by your companies.</p>
        </div>
      </section>

      {showForm && <section className="fleet-form-card">
        <h2>{editingId ? "Edit fleet" : "Add fleet"}</h2>
        {!editingId && companies.length === 0 && !loading && (
          <p className="form-note">Create a company before adding a fleet.</p>
        )}

        <form onSubmit={handleSubmit} className="fleet-form">
          {isAdmin ? (
            <label>
              Company
              <select name="companyId" value={form.companyId} onChange={handleChange} disabled={Boolean(editingId)} required>
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              Company
              <input value={companies[0]?.name || "Your assigned company"} disabled />
            </label>
          )}

          <label>
            Fleet name
            <input name="name" value={form.name} onChange={handleChange} minLength="2" required />
          </label>

          <label className="full-width">
            Description <span>(optional)</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows="3" />
          </label>

          <div className="form-actions full-width">
            <button type="submit" disabled={submitting || (isAdmin ? !form.companyId : !loggedInUser?.companyId)}>
              {submitting ? "Saving..." : editingId ? "Save changes" : "Add fleet"}
            </button>
            {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </section>}

      {error && <p className="error-message">{error}</p>}

      <section className="fleet-list-card">
        <div className="list-heading">
          <div className="fleet-list-title">
            <h2>All fleets</h2>
            <span>{pagination?.total || 0}</span>
          </div>
          <button type="button" onClick={() => { resetForm(); setShowForm(true); }}>Add new fleet</button>
        </div>

        {loading ? <p>Loading fleets...</p> : fleets.length === 0 ? <p>No fleets yet.</p> : (
          <div className="fleet-list">
            {fleets.map((fleet) => (
              <article className="fleet-row" key={fleet.id}>
                <div>
                  <h3>{fleet.name}</h3>
                  <p>{fleet.company?.name || "Unknown company"}</p>
                  {fleet.description && <p>{fleet.description}</p>}
                </div>
                <div className="row-actions">
                  <button type="button" className="secondary-button" onClick={() => handleEdit(fleet)}>Edit</button>
                  <button type="button" className="danger-button" onClick={() => handleDelete(fleet)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={loadPageData} />
      </section>
    </main>
  );
}

export default Fleets;
