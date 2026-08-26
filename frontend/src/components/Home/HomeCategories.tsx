import { Link } from "react-router-dom"
import { categoriesData } from "../../assets/assets"



const HomeCategories = () => {
    
  return (
    <section className="py-16">
        <div className="max-w-7xl mx-auto">
            <div>
                <h2 className="text-charcoal font-semibold">Browse Categories</h2>
                <p className="text-sm text-leaf-600 mt-1">Choose your daily products</p>
            </div>
            <div 
             
            className="flex items-center mt-8 gap-2 overflow-x-auto scroll-smooth  snap-x snap-mandatory cursor-grab active:cursor-grabbing">
                {
                    categoriesData.map(cat=>
                    (
                        <Link key={cat.slug} to={`/products?category=${cat.slug}`} onClick={()=>window.scrollTo(0,0)} className="group flex flex-col items-center gap-3 p-4">
                            <div className="size-18 sm:size-26 sm:p-2 rounded-2xl overflow-hidden bg-mango-200 group-hover:ring-2 ring-mango-300/75">
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-contain rounded-full transition-all"/>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-charcoal-600 text-center leading-tight">
                                    {cat.name}
                                </span>
                            </div>
                        </Link>
                    )
                    )
                }
            </div>
        </div>
    </section>
  )
}

export default HomeCategories