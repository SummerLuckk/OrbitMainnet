import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

// export async function POST(req) {
//   const {
//     walletAddress,
//     data,
//     nonce,
//     deadline,
//     newOwner,
//     signerAddress, 
//     signature,
//     name,
//   } = await req.json();

//   // Connect to MongoDB
//   const client = await MongoClient.connect(process.env.NEXT_PUBLIC_MONGODB_URI);
//   const db = client.db("Orbit");
//   const collection = db.collection("wallet-settings");

//   try {
//     // Check if the signer has already signed
//     const existingSignature = await collection.findOne({
//       walletAddress,
//       signerAddress
//     });

//     if (existingSignature) {
//       return new NextResponse(
//         JSON.stringify({ message: "This address has already signed the transaction" }),
//         { status: 400 }
//       );
//     }

//     // Store the new signature
//     const result = await collection.insertOne({
//         walletAddress,
//         data,
//         nonce,
//         deadline,
//         newOwner,
//         signerAddress, 
//         signature,
//         name,
//         timestamp: new Date()
//     });

//     return new NextResponse(
//       JSON.stringify({ message: "Signature stored successfully", id: result.insertedId }),
//       { status: 200 }
//     );
//   } catch (error) {
//     return new NextResponse(
//       JSON.stringify({
//         message: "Error storing signature",
//         error: error.message,
//       }),
//       { status: 500 }
//     );
//   } finally {
//     // Close the MongoDB connection
//     await client.close();
//   }
// }

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;
const DB_NAME = "Orbit";
const COLLECTION_NAME = "wallet-settings";

export async function GET(req:Request) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('walletAddress');
  const nonce = searchParams.get('nonce');

  // Connect to MongoDB
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);


  try {

    console.log(walletAddress,nonce)
    // Fetch all signatures for the given wallet address and transaction index
    const signatures = await collection.findOne({ walletAddress,nonce,});

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