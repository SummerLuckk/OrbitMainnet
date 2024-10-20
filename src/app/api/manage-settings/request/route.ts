import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";



const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;
  const DB_NAME = "Orbit";
  const COLLECTION_NAME = "wallet-settings";

export async function POST(req:Request) {
  const {
    walletAddress,
    data,
    nonce,
    deadline,
    newOwner,
    signerAddress, 
    threshold,
    signature,
    name,
    status,
    transactionType,
  } =  await req.json();

  // Connect to MongoDB
  

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  try {
    // Check if the signer has already signed
    const existingSignature = await collection.findOne({
      nonce,
      walletAddress,
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
        data,
        nonce,
        deadline,
        newOwner,
        threshold,
        signerAddress:[signerAddress], 
        signature:[signature],
        name,
        timestamp: new Date(),
        status,
        transactionType,
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
  const transactionType = searchParams.get('transactionType');


  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  const status="active";



  try {
    // Fetch all signatures for the given wallet address and transaction index
    const signatures = await collection.find({ walletAddress ,status,transactionType}).toArray();
    

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


export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  
  const {
    walletAddress,
    nonce,
   
  } =  await req.json();

  // Connect to MongoDB
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  try {
    // Check if the record exists
    console.log(walletAddress)
    const existingRecord = await collection.findOne({ walletAddress, nonce });
    
    if (!existingRecord) {
      return new NextResponse(
        JSON.stringify({ message: "Record not found" }),
        { status: 404 }
      );
    }

    // Update the status to "completed"
    const result = await collection.updateOne(
      { walletAddress, nonce },
      { $set: { status: "completed" } }
    );

    return new NextResponse(
      JSON.stringify({ message: "Status updated to completed", modifiedCount: result.modifiedCount }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error updating status",
        error: (error as Error).message,
      }),
      { status: 500 }
    );
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
