import { MAX_SEARCH_OFFSET, searchProducts } from "@/lib/catalog";

// Next page of search results for the "Show more" button: GET /api/search?q=…&offset=24
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q") ?? "";
  const requested = Number.parseInt(params.get("offset") ?? "", 10) || 0;
  const offset = Math.min(Math.max(requested, 0), MAX_SEARCH_OFFSET);

  const { products, total } = await searchProducts(query, offset);
  return Response.json({ products, total });
}
