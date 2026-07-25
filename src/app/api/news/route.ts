import { NextRequest, NextResponse } from "next/server";

function formatTimeAgo(epochSeconds: number) {
  const diff = Math.floor(Date.now() / 1000) - epochSeconds;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query"); // Can be a ticker (^BSESN) or country ("India Economy")

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=6`;
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error("Fetch failed");
    const data = await res.json();

    const news = (data.news || []).map((item: any) => ({
      id: item.uuid,
      source: item.publisher,
      time: formatTimeAgo(item.providerPublishTime),
      headline: item.title,
      link: item.link,
      imageUrl: item.thumbnail?.resolutions?.[0]?.url || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
      summary: "Click to read full coverage on " + item.publisher,
    }));

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}