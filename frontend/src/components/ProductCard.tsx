import { useNavigate } from "react-router-dom"
import type { Product } from "../types"
import { Plus, Star } from "lucide-react"
import { useCart } from "../context/CarContext"

interface Props{
    product:Product
}

const ProductCard = ({product}:Props) => {
    const currency = "৳"
    const {addToCart} = useCart()
    const navigate = useNavigate()
   
  return (
    <div className="bg-mist-200 rounded-2xl overflow-hidden shadow hover:shadow-md transition-all duration-300 group animate-fade-in cursor-pointer" onClick={()=>navigate(`/products/${product?.id}`)}>
        {/* image */}
        <div className="relative aspect-square overflow-hidden">
            
            <img src={product.image} alt={product.name} className="w-full h-full object-cover p-4 group-hover:p-2 transition-all duration-300"/>

            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                {product.discount > 0 && <span className="bg-tomato text-white font-sans text-caption font-semibold px-3 py-1 rounded-drop">{product.discount}% OFF</span>}
                
            </div>
            
        </div>
        {/* info */}
        <div className="p-3.5 text-charcoal-500">
            <h3 className="text-sm leading-snug mb-1.5 line-clamp-2">{product.name}</h3>
            {/* rating */}
            {
                product.rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="size-3 text-mango fill-amber-400"/>
                        <span className="text-xs font-medium text-tomato">{product.rating}</span>
                        <span className="text-xs text-charcoal">({product.reviewCount})</span>
                    </div>
                )
            }
            {/* price + add */}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 truncate">
                    <span className="text-base font-medium">{product.price.toFixed(1)} {currency}</span>
                    <span className="text-xs text-leaf block">
                        /{product.unit}
                        {product.originalPrice > product.price && <span className="text-xs text-charcoal line-through ml-1.5">
                            {product.originalPrice.toFixed(1)} {currency}</span>}
                    </span>
                </div>

                <button onClick={(e)=>{e.stopPropagation();addToCart(product)}} className="size-7 rounded-full bg-mango-500 text-white flex-center shrink-0 hover:bg-mango-700 transition-colors active:scale-95">
                    <Plus className="size-3.5"/>
                </button>
            </div>
        </div>
    </div>
  )
}

export default ProductCard