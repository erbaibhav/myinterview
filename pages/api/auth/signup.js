import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, setTokenCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = signToken(user);
    setTokenCookie(res, token);

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
