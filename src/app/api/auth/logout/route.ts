import { destroySession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ message: "Signed out successfully" });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
