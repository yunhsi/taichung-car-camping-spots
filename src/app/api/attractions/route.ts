import { NextResponse } from "next/server";

import { readAttractions } from "@/features/attractions/data/attractions";
import themeCategories from "@/features/attractions/data/taichung-theme-categories.json";
import townships from "@/features/attractions/data/taichung-townships.json";

export function GET() {
  return NextResponse.json({
    attractions: readAttractions(),
    themeCategories,
    townships,
  });
}
