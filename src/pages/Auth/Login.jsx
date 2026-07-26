import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/auth.service";
import { validateLogin } from "./auth.validation";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((currentData) => ({ ...currentData, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateLogin(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      await login({ ...formData, email: formData.email.trim().toLowerCase() });
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.error || error.message || "Invalid email or password");
    }
  };

  return (
    <div className="auth-page auth-with-image">
      <aside className="auth-visual" aria-label="Maritime logistics overview">
        <div className="auth-visual-content">
          <p className="auth-visual-brand">⚓ ShipOps</p>
          <h2>Operate every voyage with confidence.</h2>
          <p>One workspace for fleet readiness, vessel movement, and shipment operations.</p>
          <div className="auth-feature-list"><span>Live vessel status</span><span>Shipment visibility</span><span>Shared operations view</span></div>
        </div>
      </aside>
      <main className="auth-content">
      <div className="auth-card">
        <p className="auth-kicker">Welcome back</p>
        <h1>Sign in to ShipOps</h1>
        <p className="auth-subtitle">Use your account to continue to your operations workspace.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && <span id="email-error" className="field-error">{errors.email}</span>}
          </label>

          <label>
            Password
            <span className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
            {errors.password && <span id="password-error" className="field-error">{errors.password}</span>}
          </label>

          <button type="submit">Sign in</button>
        </form>

        {message && <p className="form-message">{message}</p>}

        <p className="auth-switch">New to ShipOps? <Link to="/register">Create an account</Link></p>
      </div>
      </main>
    </div>
  );
}

export default Login;
