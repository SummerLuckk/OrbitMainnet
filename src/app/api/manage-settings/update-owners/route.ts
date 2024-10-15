import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB connection string
const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;
const DB_NAME = "Orbit";
const COLLECTION_NAME = "multisig-wallets";

// API to add a new signer to an existing multisig wallet
export async function PUT(req: Request) {
  const { walletAddress, newSigner } = await req.json();

  // Extract the new signer details
  const { address, name } = newSigner;

  // Connect to MongoDB
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  try {
    // Find the wallet by walletAddress
    const existingWallet = await collection.findOne({ walletAddress });

    if (!existingWallet) {
      return new NextResponse(
        JSON.stringify({
          message: "Wallet not found",
        }),
        { status: 404 }
      );
    }

    // Update the wallet by adding the new signer
    const result = await collection.updateOne(
      { walletAddress },
      {
        $addToSet: {
          signerAddresses: address, // Add the new signer address
          signerWithName: { address, name }, // Add the new signer with name
        },
      }
    );

    if (result.modifiedCount === 0) {
      return new NextResponse(
        JSON.stringify({
          message: "No changes made to the wallet",
        }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Signer added successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error updating multisig wallet",
        error: (error as Error).message,
      }),
      { status: 500 }
    );
  } finally {
    // Close MongoDB connection
    await client.close();
  }
}
