import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB connection string
const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;
const DB_NAME = "Orbit";
const COLLECTION_NAME = "multisig-wallets";

// API to fetch wallets based on createdBy
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const createdBy = searchParams.get("createdBy");

  if (!createdBy) {
    return new NextResponse(
      JSON.stringify({
        message: "createdBy is required",
      }),
      { status: 400 }
    );
  }

  // Connect to MongoDB
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  try {
    // Find all wallets created by the specified user
    const wallets = await collection.find({  signerAddresses: createdBy}).toArray();

    if (wallets.length === 0) {
      return new NextResponse(
        JSON.stringify({
          message: "No wallets found for this user",
        }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Wallets fetched successfully",
        wallets,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error fetching wallets",
        error: (error as Error).message,
      }),
      { status: 500 }
    );
  } finally {
    // Close MongoDB connection
    await client.close();
  }
}
