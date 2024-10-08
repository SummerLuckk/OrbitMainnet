// pages/api/transaction/get-by-wallet.ts

import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB connection string
const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;
const DB_NAME = "Orbit";
const COLLECTION_NAME = "transactions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get("walletAddress");
  const connectedUserAddress = searchParams.get("connectedUserAddress"); // The user's wallet address

  if (!walletAddress || !connectedUserAddress) {
    return new NextResponse(
      JSON.stringify({
        message: "walletAddress and connectedUserAddress are required",
      }),
      { status: 400 }
    );
  }

  // Connect to MongoDB
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  try {
    // Fetch the transactions for the given walletAddress
    const transactions = await collection
      .find({
        walletAddress,
        requiredSignatures: { $in: [connectedUserAddress] }, // Ensure the user is one of the required signers
      })
      .toArray();

    if (!transactions || transactions.length === 0) {
      return new NextResponse(
        JSON.stringify({
          message: "No transactions found for the given wallet or user",
        }),
        { status: 404 }
      );
    }

    return new NextResponse(JSON.stringify(transactions), { status: 200 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error fetching transactions",
        error: (error as Error).message,
      }),
      { status: 500 }
    );
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
