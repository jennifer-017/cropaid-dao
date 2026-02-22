import { Schema, model, models, type Model } from "mongoose";

export type PoolDoc = {
  key: "singleton";
  totalStaked: number;
  totalPaidOut: number;
  updatedAt: Date;
  createdAt: Date;
};

const PoolSchema = new Schema<PoolDoc>(
  {
    key: { type: String, required: true, unique: true, default: "singleton" },
    totalStaked: { type: Number, required: true, default: 0 },
    totalPaidOut: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const Pool: Model<PoolDoc> = models.Pool ?? model<PoolDoc>("Pool", PoolSchema);
