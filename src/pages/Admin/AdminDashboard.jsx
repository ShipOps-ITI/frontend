import { useEffect, useState } from "react";
import { getUsers, createUser, updateUserRole, deleteUser } from "../../services/admin.service";
import { getUser } from "../../services/auth.service";
import "./AdminDashboard.css";

const ROLES = ["ADMIN", "FLEET_MANAGER", "CUSTOMER", "CAPTAIN", "PORT_OPERATOR"];

const emptyForm = { name: "", email: "", password: "", role: "CUSTOMER" };

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [rowErrors, setRowErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const currentUser = getUser();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setPageError("");
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setPageError(err.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole, prevRole) {
    setRowErrors((prev) => ({ ...prev, [userId]: "" }));
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role ?? newRole } : u))
      );
    } catch (err) {
      setRowErrors((prev) => ({
        ...prev,
        [userId]: err.response?.data?.message || "Role update failed.",
      }));
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: prevRole } : u))
      );
    }
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setRowErrors((prev) => ({ ...prev, [userId]: "" }));
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setRowErrors((prev) => ({
        ...prev,
        [userId]: err.response?.data?.message || "Delete failed.",
      }));
    }
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const newUser = await createUser(form);
      setUsers((prev) => [newUser, ...prev]);
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  }

  function openModal() {
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormError("");
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="eyebrow">ShipOps</p>
          <h1>Admin Dashboard</h1>
          <p>Manage all registered users and their roles.</p>
        </div>
        <button type="button" onClick={openModal}>Add User</button>
      </section>

      {pageError && <p className="error-message">{pageError}</p>}

      <section className="admin-table-card">
        <div className="list-heading">
          <h2>All Users</h2>
          <span>{users.length}</span>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value, user.role)
                        }
                        className="role-select"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {rowErrors[user.id] && (
                        <span className="row-error">{rowErrors[user.id]}</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? "active" : "inactive"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={currentUser?.id === user.id}
                        title={currentUser?.id === user.id ? "Cannot delete your own account" : "Delete user"}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add User</h2>
            <form onSubmit={handleCreateUser} className="modal-form">
              <label>
                Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                Role
                <select name="role" value={form.role} onChange={handleFormChange}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
              {formError && <p className="error-message">{formError}</p>}
              <div className="modal-actions">
                <button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create User"}
                </button>
                <button type="button" className="secondary-button" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
