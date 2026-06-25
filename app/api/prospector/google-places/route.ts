import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { apiKey, query, location } = body as Record<string, string>;

  if (!apiKey) return NextResponse.json({ error: "Google Places API key required" }, { status: 401 });
  if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

  const textQuery = location ? `${query} em ${location}` : query;

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.rating",
          "places.userRatingCount",
          "places.nationalPhoneNumber",
          "places.internationalPhoneNumber",
          "places.websiteUri",
          "places.googleMapsUri",
          "places.businessStatus",
        ].join(","),
      },
      body: JSON.stringify({ textQuery, languageCode: "pt-BR", regionCode: "BR", pageSize: 20 }),
      signal: AbortSignal.timeout(25000),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message ?? `Google Places HTTP ${res.status}`, details: data }, { status: res.status });
    }

    const places = (data.places ?? []).map((place: any) => ({
      id: place.id,
      name: place.displayName?.text ?? "",
      address: place.formattedAddress ?? "",
      rating: place.rating ?? null,
      reviews: place.userRatingCount ?? 0,
      phone: place.nationalPhoneNumber ?? place.internationalPhoneNumber ?? "",
      website: place.websiteUri ?? "",
      mapsUrl: place.googleMapsUri ?? "",
      status: place.businessStatus ?? "",
    }));

    return NextResponse.json({ places });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Google Places request failed" }, { status: 500 });
  }
}
