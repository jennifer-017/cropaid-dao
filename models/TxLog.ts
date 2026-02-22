import { Schema, model, models, type Model } from "mongoose";

export type TxType =
	| "STAKE"
	| "CLAIM_SUBMITTED"
	| "VOTE_CAST"
	| "CLAIM_APPROVED"
	| "CLAIM_REJECTED"
	| "PAYOUT";

export type TxLogDoc = {
	txHash: string;
	type: TxType;
	actorUserId?: string;
	claimId?: string;
	amount?: number;
	meta?: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
};

const TxLogSchema = new Schema<TxLogDoc>(
	{
		txHash: { type: String, required: true, unique: true },
		type: { type: String, required: true },
		actorUserId: { type: String },
		claimId: { type: String },
		amount: { type: Number },
		meta: { type: Schema.Types.Mixed },
	},
	{ timestamps: true }
);

export const TxLog: Model<TxLogDoc> = models.TxLog ?? model<TxLogDoc>("TxLog", TxLogSchema);

