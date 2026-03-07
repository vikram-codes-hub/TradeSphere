import jwt from "jsonwebtoken";

/* ── Generate access token ───────────────────────────────── */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/* ── Verify token ────────────────────────────────────────── */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/* ── Decode without verifying (for expired token info) ───── */
export const decodeToken = (token) => {
  return jwt.decode(token);
};