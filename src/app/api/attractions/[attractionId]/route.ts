import { NextResponse } from "next/server";

import { readAttraction } from "@/features/attractions/data/attraction";

interface AttractionRouteProps {
  params: Promise<{ attractionId: string }>;
}

export async function GET(
  _request: Request,
  { params }: AttractionRouteProps,
) {
  const { attractionId } = await params;
  const attraction = readAttraction(attractionId);

  if (!attraction) {
    return NextResponse.json({ error: "Attraction not found" }, { status: 404 });
  }

  return NextResponse.json({ attraction });
}
