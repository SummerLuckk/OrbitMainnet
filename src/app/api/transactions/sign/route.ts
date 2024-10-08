import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { Transaction } from "@/app/types/types";

// MongoDB connection string
const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;
const DB_NAME = "Orbit";
const COLLECTION_NAME = "transactions";

export async function POST(req: Request) {
  const { walletAddress, txHash, signerAddress, signature } = await req.json();

  // Connect to MongoDB
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  try {
    // Find the transaction by walletAddress and txHash
    const transaction = await collection.findOne({
      walletAddress,
      txHash,
    });

    if (!transaction) {
      return new NextResponse(
        JSON.stringify({ message: "Transaction not found" }),
        { status: 404 }
      );
    }

    // Check if the signer has already signed the transaction
    if (transaction.signatures[signerAddress]) {
      return new NextResponse(
        JSON.stringify({
          message: "This address has already signed the transaction",
        }),
        { status: 400 }
      );
    }

    // Add the signature to the transaction
    transaction.signatures[signerAddress] = signature;

    // Update the transaction in the database
    await collection.updateOne(
      { _id: transaction._id },
      { $set: { signatures: transaction.signatures } }
    );

    return new NextResponse(
      JSON.stringify({ message: "Signature stored successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error storing signature",
        error: (error as Error).message,
      }),
      { status: 500 }
    );
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
