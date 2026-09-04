import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Home, Search } from "lucide-react";
import type { Product } from "../types";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";
import { useDebounce } from "../hooks/useDebounce";
import { fetchSearchResults } from "../api/products";



const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  

  // TanStack Query to fetch search results dynamically
  const { data, isLoading, isError } = useQuery({
    queryKey: ["searchProducts", query],
    queryFn: () => fetchSearchResults(query),
    enabled: query.length > 0, // Only fetch if a query exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Extract products safely from response (handles both array or object payloads)
  const products: Product[] = data?.data ??  [];

  return (
    <div className="min-h-screen bg-mist-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-light mb-6">
          <Link to="/" className="hover:text-leaf transition-colors">
            <Home className="size-4" />
          </Link>
          <span>/</span>
          <span className="text-leaf font-medium">Search Result</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-leaf mb-1">
            Results for "{query}"
          </h1>
          <p className="text-sm text-light">
            {isLoading ? "Searching..." : `${products.length} items found`}
          </p>
        </div>

        {/* Results Body */}
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-charcoal font-medium">Failed to load search results.</p>
          </div>
        ) : !query || products.length === 0 ? (
          <div className="text-center py-20">
            <Search className="size-16 text-charcoal mx-auto mb-4" />
            <h2 className="text-charcoal font-semibold text-lg">No result found</h2>
            <p className="text-sm text-charcoal mb-6 max-w-md mx-auto">
              We couldn't find any products matching "{query}". Try a different search term.
            </p>
            <Link
              to="/products"
              className="px-14 py-4 bg-mist-400 inline-flex items-center justify-center gap-3 rounded-md text-white hover:bg-charcoal transition-colors"
            >
              Browse All Products <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResult;