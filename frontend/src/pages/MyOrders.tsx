import { useEffect, useState } from "react"
import type { Order } from "../types"
import { Link, useSearchParams } from "react-router-dom"
import { useCart } from "../context/CarContext"
import { dummyDashboardOrdersData } from "../assets/assets"
import Loading from "../components/Loading"
import { CalendarIcon, ChevronRightIcon, PackageIcon } from "lucide-react"

const statusCode: Record<"All" | "Placed" | "Out for Delivery" | "Delivered", string> = {
  "All": "bg-mist-200 text-charcoal-600",
  "Placed": "bg-mango-100 text-mango-700",
  "Out for Delivery": "bg-leaf-100 text-leaf-700",
  "Delivered": "bg-leaf text-white",
}

const MyOrders = () => {
  const [orders,setOrders] = useState<Order[]>([])
  const [loading,setLoading] = useState(true)
  const [activeTab,setActiveTab] = useState("All")
  const [searchParams,setSearchParams] = useSearchParams()
  const currency = "৳"
  const tabs = ["All","Placed","Out for Delivery","Delivered"]
  const {clearCart} = useCart()

  const fetchOrders = async()=>{
    setOrders(dummyDashboardOrdersData as any)
    setLoading(false)
  }

  useEffect(()=>{
    if(searchParams.get("clearCart")){
      clearCart();
      setSearchParams({})
      setTimeout(()=>{
        fetchOrders()
      },1200)
       
    } else{
       fetchOrders()
    }
    setLoading(false)
  },[activeTab])
  return (
    <div className="min-h-screen bg-mist mb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1>My Orders</h1>
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {
            tabs.map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)} className={`
                px-4 py-2 mt-6 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${activeTab === tab ? "bg-leaf text-white": "bg-white text-charcoal hover:text-charcoal-500"}`}>{tab}</button>
            ))
          }
        </div>

        {/* Orders list */}
        {
          loading ? (<Loading/>):orders.length === 0 ? (
            <div className="text-center py-16">
              <PackageIcon className="size-16 text-charcoal/60 mx-auto mb-4"/>
              <h2 className="text-lg font-medium text-leaf mb-2">No orders yet</h2>
              <p className="text-sm text-forest mb-4">Start shopping to see your orders here</p>
              <Link to='/products' className="inline-flex px-4 py-2 bg-leaf text-white text-sm rounded-lg">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {
                orders.map(order =>(
                  <Link key={order._id} to={`/orders/${order._id}`} className="block max-w-4xl bg-white rounded-2xl p-5 hover:shadow transition-all">
                    {/* order id,date & */}
                    <div className="flex justify-between items-center">
                      <div>
                      <p className="text-sm font-medium text-leaf">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarIcon className="size-3"/>
                        <span className="text-xs text-charcoal">{new Date(order.createdAt).toLocaleDateString("en-US",{
                          month:"long",
                          day:"numeric",
                          year:"numeric",

                        })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <span className={`px-4 py-1 text-xs font-medium rounded-full ${statusCode[order.status as keyof typeof statusCode] ?? "bg-mist-200 text-charcoal-600"}`}>
                        {order.status} 
                       </span>
                       <ChevronRightIcon className="size-4"/>
                    </div>
                    </div>
                    {/* item thumbnail */}
                    <div className="flex items-center gap-2 my-3">
                      {
                        order.items.slice(0,4).map((item,i)=>(
                          <img key={i} src={item.image} alt={item.name}
                          className="size-12 sm:size-16 rounded-lg object-cover border border-leaf"/>
                        ))
                      }
                      {
                        order.items.length > 4 && <div className="size-12 sm:size-16 rounded-lg bg-mist flex-center text-xs font-semibold text-light">
                          +{order.items.length - 4}
                        </div>
                      }
                    </div>
                    {/* total items & orice */}

                    <div className="flex justify-between items-center pt-3 text-sm">
                      <span className="text-light">{order.items.length} items</span>

                  <span className="text-light text-[18px] font-bold">{order.total.toFixed(2)} {currency}</span>
                    </div>
                  </Link>
                ))
              }
            </div>
          )
        }
      </div>
    </div>
  )
}

export default MyOrders