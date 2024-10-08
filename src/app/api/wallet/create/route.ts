import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB connection string
const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;
const DB_NAME = "Orbit";
const COLLECTION_NAME = "multisig-wallets";

// API to store a new multisig wallet
export async function POST(req: Request) {
  const { walletAddress, name, signerWithName, createdBy, requiredSignatures } =
    await req.json();

  // Create an array of signer addresses from signerWithName
  const signerAddresses = signerWithName.map(
    (signer: { address: string }) => signer.address
  );

  // Connect to MongoDB
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  try {
    // Check if a wallet with the same address already exists
    const existingWallet = await collection.findOne({ walletAddress });

    if (existingWallet) {
      return new NextResponse(
        JSON.stringify({
          message: "A wallet with this address already exists",
        }),
        { status: 400 }
      );
    }

    // Insert the new wallet with both signer address array and signerWithName
    const result = await collection.insertOne({
      walletAddress,
      name,
      signerAddresses, // Array of signer addresses
      signerWithName, // Array of signerName and signer (address)
      createdBy,
      requiredSignatures,
      createdAt: new Date(),
    });

    return new NextResponse(
      JSON.stringify({
        message: "Multisig wallet created successfully",
        id: result.insertedId,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error creating multisig wallet",
        error: (error as Error).message,
      }),
      { status: 500 }
    );
  } finally {
    // Close MongoDB connection
    await client.close();
  }
}
