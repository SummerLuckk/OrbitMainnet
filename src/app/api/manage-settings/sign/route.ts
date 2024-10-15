import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;
const DB_NAME = "Orbit";
const COLLECTION_NAME = "wallet-settings";

// API to add a new signer and signature for a given nonce
export async function PUT(req: Request) {
  const {
    walletAddress,
    nonce,
    signerAddress,
    signature,
  } = await req.json();

  // Connect to MongoDB
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  try {
    // Find the document with the specified wallet address and nonce

    console.log(walletAddress, nonce,signerAddress,signature);
    const existingEntry = await collection.findOne({ walletAddress, nonce });
    console.log(existingEntry)

    if (!existingEntry) {
      return new NextResponse(
        JSON.stringify({ message: "No entry found for this wallet address and nonce" }),
        { status: 404 }
      );
    }

    // Check if the signer has already signed
    if (existingEntry.signerAddress.includes(signerAddress)) {
      return new NextResponse(
        JSON.stringify({ message: "This address has already signed the transaction" }),
        { status: 400 }
      );
    }

    // Update the arrays with the new signer address and signature
    await collection.updateOne(
      { walletAddress, nonce },
      {
        $addToSet: {
          signerAddress, // Add the new signer address
          signature,     // Add the new signature
        },
      }
    );

    return new NextResponse(
      JSON.stringify({ message: "Signer and signature stored successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error updating signature",
      }),
      { status: 500 }
    );
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
