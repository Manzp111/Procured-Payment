// utils/validators.ts
export const validatePassword = (password: string, user: { email: string; phone: string; first_name: string; last_name: string }) => {
  const errors: string[] = [];

  if (password.length < 8) errors.push("Password must be at least 8 characters long");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least 1 uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least 1 lowercase letter");
  if (!/\d/.test(password)) errors.push("Password must contain at least 1 digit");
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) errors.push("Password must contain at least 1 special character");

  // Check personal info
  const personalFields = [user.email, user.phone, user.first_name, user.last_name];
  personalFields.forEach((field) => {
    if (field && password.toLowerCase().includes(field.toLowerCase())) {
      errors.push("Password cannot contain your personal information");
    }
  });

  return errors;
};
