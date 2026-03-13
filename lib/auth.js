import jwt from "jsonwebtoken";
import cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getUserFromReq(req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function setTokenCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
  );
}

export function clearTokenCookie(res) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })
  );
}