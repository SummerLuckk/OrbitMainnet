export interface SignerWithName {
  name: string; // The name of the signer
  address: string; // The address of the signer
}

export interface MultisigWallet {
  _id: string; // The unique identifier for the wallet
  walletAddress: string; // The address of the multisig wallet
  name: string; // The name of the multisig wallet
  signerAddresses: string[]; // Array of signer addresses
  signerWithName: SignerWithName[]; // Array of signer objects with names and addresses
  requiredSignatures: string;
  createdBy: string; // The address of the user who created the wallet
  createdAt: Date; // The timestamp of when the wallet was created
}

export interface MultisigWalletsResponse {
  message: string; // Message regarding the API response
  wallets: MultisigWallet[]; // Array of multisig wallets
}

export interface TokenDetails {
  name: string;
  symbol: string;
  decimals: string;
  balance: bigint;
}

export interface Transaction {
  walletAddress: string; // The address of the associated multisig wallet
  txHash: string; // The transaction hash
  createdBy: string; // Address of the user who created the transaction
  requiredSignatures: string[]; // Array of signer addresses required to sign this transaction
  signatures: { [key: string]: string }; // Map of signer addresses to their signatures
  executed: boolean; // Flag to indicate if the transaction has been executed
  createdAt: Date; // Timestamp of when the transaction was created
  scheduledTime: Date; // The time when the transaction is scheduled to be executed
}
