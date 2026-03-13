import { getUserFromReq } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getCompanyBySlug } from "@/lib/companies";
import Progress from "@/models/Progress";

export default async function handler(req, res) {
  const decoded = getUserFromReq(req);
  if (!decoded) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { slug } = req.query;
  const company = getCompanyBySlug(slug);
  if (!company) {
    return res.status(404).json({ error: "Company not found" });
  }

  await connectDB();

  if (req.method === "POST") {
    const { questionId, solved } = req.body;

    if (!questionId || typeof solved !== "boolean") {
      return res.status(400).json({ error: "questionId and solved (boolean) are required" });
    }

    try {
      if (solved) {
        await Progress.findOneAndUpdate(
          { userId: decoded.userId, companySlug: slug },
          { $addToSet: { solvedQuestionIds: questionId } },
          { upsert: true, new: true }
        );
      } else {
        await Progress.findOneAndUpdate(
          { userId: decoded.userId, companySlug: slug },
          { $pull: { solvedQuestionIds: questionId } }
        );
      }

      const progress = await Progress.findOne({
        userId: decoded.userId,
        companySlug: slug,
      });

      return res.status(200).json({
        solvedCount: progress?.solvedQuestionIds?.length || 0,
      });
    } catch (error) {
      console.error("Progress update error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
