import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromReq } from "@/lib/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const decoded = getUserFromReq(req);
  if (!decoded) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    await connectDB();
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
