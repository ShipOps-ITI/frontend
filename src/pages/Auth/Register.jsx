import { useState } from "react";
import { register } from "../../services/auth.service";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await register(formData);

      setMessage("✅ User registered successfully!");

      navigate("/login");

      console.log(response.data);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER",
      });

    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Registration failed"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Create Account</h1>

        <form onSubmit={handleSubmit} className="auth-form">

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
            <option value="FLEET_MANAGER">Fleet Manager</option>
            <option value="CAPTAIN">Captain</option>
            <option value="PORT_OPERATOR">Port Operator</option>
          </select>

          <button type="submit">
            Register
          </button>

        </form>

        {message && <p>{message}</p>}

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;