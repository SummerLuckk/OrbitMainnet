import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;
const DB_NAME = "Orbit";
const COLLECTION_NAME = "orbit-wallet";

export async function POST(req:Request) {
  const {
    walletAddress,
    txIndex,
    signature,
    signerAddress
  } = await req.json();


  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
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
        
      }),
      { status: 500 }
    );
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}

export async function GET(req:Request) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('walletAddress');
  const txIndex = searchParams.get('txIndex');

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);



  try {
    // Fetch all signatures for the given wallet address and transaction index
    const signatures = await collection.find({ walletAddress, txIndex:txIndex }).toArray();

    return new NextResponse(
      JSON.stringify({ signatures }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error fetching signatures",
      }),
      { status: 500 }
    );
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}