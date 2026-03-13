import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companySlug: { type: String, required: true },
    solvedQuestionIds: [{ type: String }],
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, companySlug: 1 }, { unique: true });

export default mongoose.models.Progress ||
  mongoose.model("Progress", ProgressSchema);