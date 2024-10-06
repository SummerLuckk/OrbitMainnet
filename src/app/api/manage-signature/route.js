import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  const {
    walletAddress,
    txIndex,
    signature,
    signerAddress
  } = await req.json();

  // Connect to MongoDB
  const client = await MongoClient.connect(process.env.NEXT_PUBLIC_MONGODB_URI);
  const db = client.db("Orbit");
  const collection = db.collection("orbit-wallet");

  try {
    // Check if the signer has already signed
    const existingSignature = await collection.findOne({
      walletAddress,
      txIndex,
      signerAddress
    });

    if (existingSignature) {
      return new NextResponse(
        JSON.stringify({ message: "This address has already signed the transaction" }),
        { status: 400 }
      );
    }

    // Store the new signature
    const result = await collection.insertOne({
      walletAddress,
      txIndex,
      signature,
      signerAddress,
      timestamp: new Date()
    });

    return new NextResponse(
      JSON.stringify({ message: "Signature stored successfully", id: result.insertedId }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error storing signature",
        error: error.message,
      }),
      { status: 500 }
    );
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('walletAddress');
  const txIndex = searchParams.get('txIndex');

  // Connect to MongoDB
  const client = await MongoClient.connect(process.env.NEXT_PUBLIC_MONGODB_URI);
  const db = client.db("Orbit");
  const collection = db.collection("orbit-wallet");

  try {
    // Fetch all signatures for the given wallet address and transaction index
    const signatures = await collection.find({ walletAddress, txIndex:"0" }).toArray();

    return new NextResponse(
      JSON.stringify({ signatures }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error fetching signatures",
        error: error.message,
      }),
      { status: 500 }
    );
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}