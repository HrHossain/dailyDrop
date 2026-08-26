import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import type { Order } from "../types";
import { dummyDashboardOrdersData } from "../assets/assets";
import Loading from "../components/Loading";
import { ArrowLeftIcon, MapIcon, PhoneIcon } from "lucide-react";
import OrderOTP from "../components/OrderTracking/OrderOTP";
import LiveMap from "../components/OrderTracking/LiveMap";
import OrderTimeLine from "../components/OrderTracking/OrderTimeLine";

const OrderTracking = () => {
  const {id} = useParams();
  const navigate = useNavigate()
  const[order,setOrder] = useState<Order | null>(null)
  const [loading,setLoading] = useState(true)
  const [liveLocation,setLiveLocation] = useState<{lat:number;lng:number} | null>(null)
const currency = "৳"
  useEffect(()=>{
    setOrder(dummyDashboardOrdersData.find(o=>o._id === id) as any)
    setLoading(false)
  },[id,navigate])

  if(loading) return <Loading/>
  if(!order) null
  return (
    <div className="min-h-screen mb-20 bg-mist">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* header */}
        <button onClick={()=>navigate("/orders")} className="flex items-center gap-2 text-sm text-light hover:text-leaf  mb-6 transition-colors">
          <ArrowLeftIcon className="size-4"/> Back to Orders
          </button>
          {/* order id,date,status */}
          <div className="flex items-center justify-between mb-8">
              <div>
                <h1>Order #{order!._id.slice(-8).toUpperCase()}</h1>
                <p className="text-forest-300 text-sm mt-1">Placed on {new Date(order!.createdAt).toLocaleDateString('en-US',{
                  month:"long",
                  day:"numeric",
                  year:"numeric"
                })}</p>
              </div>
              <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
              order!.status === "Delivered" ? "bg-forest-100 text-forest-700"
              : order!.status === "Out for Delivery" ? "bg-leaf-100 text-leaf-700"
              : order!.status === "Cancelled" ? "bg-tomato-100 text-tomato"
              : "bg-mango-100 text-mango-700" // Placed
            }`}>{order!.status}</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* timeline and map area */}
            
              <div className="lg:col-span-8 space-y-6">
                {/* otp card */}
                <OrderOTP order={order}/>
                {/* live tracking map */}
                <LiveMap order={order} liveLocation={liveLocation}/>
                {/* progress timeline */}
                <OrderTimeLine order={order}/>
                {/* delivery person */}
                {
                  order?.deliveryPartner && order.status !== "Delivered" && order.status !== "Cancelled" && (
                    <div className="bg-white rounded-2xl p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-full bg-forest flex-center text-white">
                          <span>{order.deliveryPartner.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-charcoal capitalize">{order.deliveryPartner.name}</p>
                          <p className="text-xs text-leaf capitalize">{order.deliveryPartner.vehicleType} ● Delivered</p>
                        </div>
                      </div>
                    <a href={`tel:${order.deliveryPartner.phone}`} className="p-2.5 group bg-mist-300 rounded-xl hover:bg-charcoal transition-colors">
                    <PhoneIcon className="size-4 text-leaf group-hover:text-white "/>
                  </a>
                    </div>
                  )
                }
              </div>
              
            

            {/* order details */}

            <div className="lg:col-span-4 space-y-5">
              {/* delivery address */}
              <div className="bg-white rounded-2xl p-5">
                <h3>
                  <MapIcon className="size-4"/>
                  Delivery Address
                </h3>
                <p className="text-sm text-leaf leading-relaxed">
                  {order?.shippingAddress.label}
                  <br/>
                  {order?.shippingAddress.address}
                  <br/>
                  {order?.shippingAddress.city},{order?.shippingAddress.state},{order?.shippingAddress.zip}
                  
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-leaf mb-3">Items({order?.items.length})</h3>
                <div className="space-y-3">
                  {order?.items.map((item,i)=>(
                    <div key={i} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate mb-1">{item.name}</p>
                        <p className="text-xs text-charcoal-200">X{item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">
                        {(item.price * item.quantity).toFixed(2)} <span className="text-[22px] text-leaf">{currency}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-leaf space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-light">Subtotal</span>
                    <span>{order?.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-light">Delivery</span>
                    <span>{order?.deliveryFee === 0 ? "Free" : `${order?.deliveryFee.toFixed(2)} currency `}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-light">Tax</span>
                    <span>{order?.tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-leaf font-seminbold text-charcoal">
                    <span className="text-light">Total</span>
                    <span>{order?.total.toFixed(2)} {currency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

export default OrderTracking