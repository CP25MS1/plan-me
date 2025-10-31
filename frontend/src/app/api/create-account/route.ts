import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const userData = await req.json();
    console.log("Create account data:", userData);
    return NextResponse.json({ message: "Account created successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error creating account" },
      { status: 500 }
    );
  }
}
