
const FilterPanel = ({categories,category,minPrice,maxPrice,updateFilter,clearFilters,hasFilters}:any) => {
    const categoriesWithAll = [{slug:'',name:"All Categories"},...categories]
  return (
    <div className="space-y-6">
        <div>
            <h3 className="text-sm font-semibold text-forest mb-3">Categories</h3>
            <div className="space-y-1.5">
                {
                    categoriesWithAll.map((cat:any)=>(
                        <button key={cat.slug} onClick={()=>updateFilter("category",cat.slug)} className={
                            `block w-full text-left px-3 py-2 text-sm rounded-md transition-all ${category === cat.slug ? "bg-forest text-white":"text-charcoal bg-mist"}`
                        }>
                            {cat.name}
                        </button>
                    ))
                }
            </div>
        </div>
        {/* price range */}
        <div>
            <h3 className="text-sm font-semibold text-chacoal mb-3">Price Range</h3>
            <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={minPrice}
                onChange={(e)=>updateFilter('minPrice',e.target.value)} className="w-full px-3 py-2 text-sm bg-white rounded-lg border outline-none"/>
                <span className="text-light">-</span>
                <input type="number" placeholder="Max" value={maxPrice}
                onChange={(e)=>updateFilter('maxPrice',e.target.value)} className="w-full px-3 py-2 text-sm bg-white rounded-lg border outline-none"/>
            </div>
        </div>

        {
            hasFilters && (
                <button 
                onClick={clearFilters}
                className="w-full py-2 text-sm text-red-600 hover:text-red-800 bg-mist-200 rounded-lg transition-colors font-medium"
                >Clear All Filters</button>
            )
        }
    </div>
  )
}

export default FilterPanel