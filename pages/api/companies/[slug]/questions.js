import { getUserFromReq } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { readQuestionsByCompany } from "@/lib/csv";
import { getCompanyBySlug } from "@/lib/companies";
import Progress from "@/models/Progress";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const decoded = getUserFromReq(req);
  if (!decoded) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { slug } = req.query;
  const company = getCompanyBySlug(slug);
  if (!company) {
    return res.status(404).json({ error: "Company not found" });
  }

  try {
    await connectDB();

    const questions = readQuestionsByCompany(slug);

    const progress = await Progress.findOne({
      userId: decoded.userId,
      companySlug: slug,
    });

    const solvedSet = new Set(progress?.solvedQuestionIds || []);

    const questionsWithProgress = questions.map((q) => ({
      ...q,
      solved: solvedSet.has(q.id),
    }));

    return res.status(200).json({
      company: { slug: company.slug, name: company.name },
      questions: questionsWithProgress,
      solvedCount: solvedSet.size,
      totalCount: questions.length,
    });
  } catch (error) {
    console.error("Questions error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
