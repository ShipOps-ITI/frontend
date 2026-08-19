const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGISTRATION_ROLES = ["ADMIN", "FLEET_MANAGER", "CUSTOMER"];

export const validateRegister = ({ name, email, password, role }) => {
  const errors = {};

  if (name.trim().length < 2 || name.trim().length > 100) {
    errors.name = "Name must be between 2 and 100 characters.";
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (password.length < 8 || password.length > 128) {
    errors.password = "Password must be between 8 and 128 characters.";
  }

  if (import.meta.env.VITE_ALLOW_TEST_ROLE_REGISTRATION === "true" && !REGISTRATION_ROLES.includes(role)) {
    errors.role = "Choose a valid role.";
  }

  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
};
