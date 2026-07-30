import { NextResponse } from "next/server";
import { MarketService } from "@/lib/market/market.service";

export const revalidate = 15; // Revalidate every 15 seconds

export async function GET() {
  try {
    const data = await MarketService.getLiveMarketData();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("API /api/market error:", error);
    return NextResponse.json(
      { success: false, message: "Internal market service error" },
      { status: 500 }
    );
  }
}
