import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMultisigWallet extends Document {
  name: string;
  signers: string[]; // Array of signer addresses
  createdBy: string; // Address of the creator
  requiredConfirmations: number; // Number of required confirmations
  createdAt: Date;
}

const MultisigWalletSchema: Schema = new Schema({
  name: { type: String, required: true },
  signers: { type: [String], required: true },
  createdBy: { type: String, required: true },
  requiredConfirmations: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MultisigWallet: Model<IMultisigWallet> =
  mongoose.models.MultisigWallet ||
  mongoose.model("MultisigWallet", MultisigWalletSchema);

export default MultisigWallet;
