import { useEffect, useState } from "react"
import type { Product } from "../types"
import { Link, useSearchParams } from "react-router-dom"
import { dummyProducts } from "../assets/assets"
import { ArrowRight, Home, Search } from "lucide-react"
import Loading from "../components/Loading"
import ProductCard from "../components/ProductCard"


const SearchResult = () => {
  const [products,setProducts] = useState<Product[]>([])
  const [loading,setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  useEffect(() => {
  if (!query) {
    setProducts(dummyProducts);
    setLoading(false);
    return;
  }

  setLoading(true);

  const filtered = dummyProducts.filter((p) => 
    p.name && p.name.toLowerCase().includes(query.toLowerCase())
  );

  setProducts(filtered);
  setLoading(false);
}, [query, dummyProducts]);

  return (
    <div className="min-h-screen bg-mist=200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-light mb-6">
          <Link to='/' className="hover:text-leaf transition-colors">
          <Home className="size-4"/>
          </Link>
          <span>/</span>
          <span className="text-leaf font-medium">
            Search Result
          </span>
        </nav>

        {/* header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-leaf mb-1">Results for "{query}"</h1>
          <p className="text-sm text-light">{loading ? "Searching..." : `${products.length} items found`}</p>
        </div>
        {/* result */}
        {
          loading ? (
            <Loading/>
          ):products.length === 0 ? (
            <div className="text-center py-20">
              <Search className="size-16 text-charcoal mx-auto mb-4"/>
              <h2 className="text-charcoal font-semibold">No result found</h2>
              <p className="text-sm text-charcoal mb-6 max-w-md mx-auto">we couldn't find any products matching "{query}". Try a different search term.</p>
              
                <Link to='/products' className="px-14 py-4 bg-mist-400 inline-flex items-center justify-center gap-3 rounded-md text-white hover:bg-charcoal">Browse All Products <ArrowRight className="size-4"/> </Link>
              
            </div>
          ):(
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {
                products.map(product =>(
                  <ProductCard key={product._id} product={product}/>
                ))
              }
            </div>
          )
        }
      </div>
    </div>
  )
}

export default SearchResult