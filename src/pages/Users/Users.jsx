import { useEffect, useState } from "react";
import { getUser } from "../../services/auth.service";
import { getCompanies } from "../../services/company.service";
import { getUsers, updateUser } from "../../services/users.service";
import "./Users.css";

const roles = ["ADMIN", "FLEET_MANAGER", "CUSTOMER"];

const emptyForm = {
  id: null,
  name: "",
  email: "",
  role: "CUSTOMER",
  companyId: "",
  isActive: true,
};

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

function Users() {
  const currentUser = getUser();
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [usersResponse, companiesResponse] = await Promise.all([
        getUsers(),
        getCompanies(1, 100),
      ]);
      setUsers(usersResponse.data);
      setCompanies(companiesResponse.data.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  }

  function startEditing(user) {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId ?? "",
      isActive: user.isActive,
    });
    setError("");
    setSuccess("");
  }

  function handleChange(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "role" && value === "ADMIN" ? { companyId: "" } : {}),
    }));
  }

  function cancelEditing() {
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.role === "FLEET_MANAGER" && !form.companyId) {
      setError("A Fleet Manager must be assigned to a company.");
      return;
    }

    if (form.id === currentUser?.id && (form.role !== "ADMIN" || !form.isActive)) {
      setError("You cannot remove your own Admin access or deactivate your own account.");
      return;
    }

    try {
      setSaving(true);
      await updateUser(form.id, {
        role: form.role,
        companyId: form.role === "ADMIN" ? null : (form.companyId ? Number(form.companyId) : null),
        isActive: form.isActive,
      });
      setSuccess("User updated. They must log in again before new access permissions apply.");
      setForm(emptyForm);
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update user."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="users-page">
      <section className="users-header">
        <p className="eyebrow">ShipOps Admin</p>
        <h1>User management</h1>
        <p>Assign roles and company access for your team.</p>
      </section>

      <section className="users-card">
        <h2>{form.id ? "Edit user access" : "Select a user"}</h2>
        {form.id ? (
          <form className="user-form" onSubmit={handleSubmit}>
            <label>Name<input value={form.name} disabled /></label>
            <label>Email<input value={form.email} disabled /></label>
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                {roles.map((role) => <option key={role} value={role}>{role.replace("_", " ")}</option>)}
              </select>
            </label>
            <label>
              Company {form.role === "FLEET_MANAGER" && <span>(required)</span>}
              <select name="companyId" value={form.companyId} onChange={handleChange} disabled={form.role === "ADMIN"} required={form.role === "FLEET_MANAGER"}>
                <option value="">{form.role === "ADMIN" ? "Global access" : "No company assigned"}</option>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </select>
            </label>
            <label className="active-toggle">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} disabled={form.id === currentUser?.id} />
              Account is active
            </label>
            <div className="form-actions">
              <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save access"}</button>
              <button type="button" className="secondary-button" onClick={cancelEditing}>Cancel</button>
            </div>
          </form>
        ) : <p>Select a user below to manage their access.</p>}
      </section>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <section className="users-card">
        <div className="list-heading"><h2>All users</h2><span>{users.length}</span></div>
        {loading ? <p>Loading users...</p> : users.length === 0 ? <p>No users registered yet.</p> : (
          <div className="user-list">
            {users.map((user) => (
              <article className="user-row" key={user.id}>
                <div>
                  <h3>{user.name} {!user.isActive && <small>Inactive</small>}</h3>
                  <p>{user.email}</p>
                  <p>{user.role.replace("_", " ")} · {user.companyId ? companies.find((company) => company.id === user.companyId)?.name || `Company #${user.companyId}` : "No company assignment"}</p>
                </div>
                <button type="button" className="secondary-button" onClick={() => startEditing(user)}>Manage</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Users;
