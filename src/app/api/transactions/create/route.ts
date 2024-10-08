import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { Transaction } from "@/app/types/types";

// MongoDB connection string
const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;
const DB_NAME = "Orbit";
const COLLECTION_NAME = "transactions";

export async function POST(req: Request) {
  const { walletAddress, txHash, createdBy, scheduledTime } = await req.json();

  // Connect to MongoDB
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  try {
    const wallet = await db.collection("multisig-wallets").findOne({
      walletAddress,
    });

    if (!wallet) {
      return new NextResponse(
        JSON.stringify({ message: "Multisig wallet not found" }),
        { status: 404 }
      );
    }

    const { signerAddresses } = wallet;
    // Create a new transaction object
    const newTransaction: Transaction = {
      walletAddress,
      txHash,
      createdBy,
      requiredSignatures: signerAddresses,
      signatures: {}, // Initialize signatures as an empty object
      executed: false, // Transaction is not yet executed
      createdAt: new Date(), // Timestamp for creation
      scheduledTime: new Date(scheduledTime), // Store the scheduled execution time
    };

    // Insert the new transaction into the database
    const result = await collection.insertOne(newTransaction);

    return new NextResponse(
      JSON.stringify({
        message: "Transaction scheduled successfully",
        id: result.insertedId,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error scheduling transaction",
        error: (error as Error).message,
      }),
      { status: 500 }
    );
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
