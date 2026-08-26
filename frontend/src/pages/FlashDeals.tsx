import { useEffect, useState } from "react"
import { dummyProducts } from "../assets/assets"
import type { Product } from "../types"
import { Zap } from "lucide-react"
import Loading from "../components/Loading"
import ProductCard from "../components/ProductCard"

const FlashDeals = () => {
  const [products,setProducts] = useState<Product[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    setProducts(dummyProducts.filter((p:any)=>p.stock > 0))
    setTimeout(()=> setLoading(false),1400)
  },[])
  return (
    <div className="min-h-screen bg-mist">
      {/* banner */}
      <div className="bg-linear-to-r from-mango to-mango-700 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="flex-center gap-2 mb-3">
                <Zap className="size-6 fill-white"/>
                <h1 className="text-3xl font-semibold">Flash Deals</h1>
                 <Zap className="size-6 fill-white"/>
              </div>
              <p className="text-forest-700 max-w-md mx-auto">For the next few hours, some of our freshest picks are marked down harder than we probably should allow — no coupon, no catch, just really good prices while they last.</p>
          </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {
          loading ? (<Loading/>):(
            products.length === 0 ? (
              <div className="text-center py-16">
                <Zap className="size-6 fill-white"/>
                <h2 className="text-lg font-semibold text-forest mb-2">No deals right now!</h2>
                <p className="text-sm text-white">Coming soon! amazing offers</p>
              </div>
            ):(
              <>
              <p className="my-3 text-chacoal text-md font-bold font-display">Total products : {products.length}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {
                  products.map((product)=>product.stock > 0 &&(
                    <ProductCard key={product._id} product={product}/>
                  ))
                }
              </div>
              </>
            )
          )
        }
      </div>
    </div>
  )
}

export default FlashDeals