import { Schema, model, models, type Model } from "mongoose";

export type ClaimStatus = "Pending" | "Voting" | "Approved" | "Rejected";

export type VoteChoice = "Approve" | "Reject";

export type ClaimComment = {
  userId: string;
  userName: string;
  message: string;
  createdAt: Date;
};

export type ClaimVote = {
  userId: string;
  choice: VoteChoice;
  votingPower: number;
  createdAt: Date;
};

export type ClaimDoc = {
  farmerUserId: string;
  farmerName: string;
  region: string;
  cropType: string;
  requestedAmount: number;
  evidencePhotoUrl?: string;
  status: ClaimStatus;
  submittedAt: Date;
  votingStartedAt?: Date;
  resolvedAt?: Date;
  votes: ClaimVote[];
  comments: ClaimComment[];
  createdAt: Date;
  updatedAt: Date;
};

const CommentSchema = new Schema<ClaimComment>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, required: true },
  },
  { _id: false }
);

const VoteSchema = new Schema<ClaimVote>(
  {
    userId: { type: String, required: true },
    choice: { type: String, required: true },
    votingPower: { type: Number, required: true },
    createdAt: { type: Date, required: true },
  },
  { _id: false }
);

const ClaimSchema = new Schema<ClaimDoc>(
  {
    farmerUserId: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    region: { type: String, required: true, index: true },
    cropType: { type: String, required: true },
    requestedAmount: { type: Number, required: true },
    evidencePhotoUrl: { type: String },
    status: { type: String, required: true, default: "Pending", index: true },
    submittedAt: { type: Date, required: true },
    votingStartedAt: { type: Date },
    resolvedAt: { type: Date },
    votes: { type: [VoteSchema], required: true, default: [] },
    comments: { type: [CommentSchema], required: true, default: [] },
  },
  { timestamps: true }
);

export const Claim: Model<ClaimDoc> = models.Claim ?? model<ClaimDoc>("Claim", ClaimSchema);
