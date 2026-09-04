import { useEffect, useState } from 'react'
import type { Product } from '../../types'
import { dummyProducts } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from 'lucide-react'
import ProductCard from '../ProductCard'
import { fetchPopularProducts } from '../../api/products'
import Loading from '../Loading'
import { useQuery } from '@tanstack/react-query'
const PopularProducts = () => {

   const {data, isLoading,isError} = useQuery({
    queryKey: ['popularProducts'],
    queryFn: () => fetchPopularProducts('/products?limit=10&sort=rating'), 
    staleTime: 1000 * 60 * 5, 
   })

   const products: Product[] = data?.data?.data
   console.log(products)
    if(isLoading){
        return <Loading/>
    }
    if(isError){
        return <div className='text-center text-red-500'>Failed to load popular products</div>
    }
  return (
    <section className='pb-16'>
        <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h2 className='text-charcoal-600 font-semibold'>Popular Products</h2>
                    <p className='text-sm text-leaf-700 mt-1'>Top-reated products this season</p>
                </div>
                <Link to={"/products"} className='text-sm font-semibold text-mango-500 hover:text-mango-700 flex items-center gap-1 transition-colors'>
                View All <ArrowRightIcon className='size-4'/>
                </Link>
                </div>
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-8'>
                    {
                        products.map(p=>(<ProductCard key={p._id} product={p}/>))
                    }

                </div>
            </div>
        

    </section>
  )
}

export default PopularProducts