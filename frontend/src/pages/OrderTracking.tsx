import { useNavigate, useParams } from "react-router-dom";
import type { Order } from "../types";
import Loading from "../components/Loading";
import { ArrowLeftIcon, MapIcon, PhoneIcon } from "lucide-react";
import OrderOTP from "../components/OrderTracking/OrderOTP";
import LiveMap from "../components/OrderTracking/LiveMap";
import OrderTimeLine from "../components/OrderTracking/OrderTimeLine";
import api from "../config/api";
import { useQuery } from "@tanstack/react-query";

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currency = "৳";

 
  const { data: orderResponse, isLoading: isOrderLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      const res = await api.get(`orders/${id}`);
      return res?.data?.data ?? null;
    },
    enabled: !!id,
  });

  const order: Order | null = orderResponse;

  
  const { data: liveLocationData } = useQuery({
    queryKey: ['order-live-location', id],
    queryFn: async () => {
      const res = await api.get(`orders/${id}/location`);
      return res?.data?.data ?? null;
    },
    enabled: !!id && order?.status === "Out for Delivery",
    refetchInterval: 3000, 
  });

  const liveLocation = liveLocationData || null;
  console.log(liveLocation)
  if (isOrderLoading) return <Loading />;
  if (!order) return null;

  return (
    <div className="min-h-screen mb-20 bg-mist">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       
        <button onClick={() => navigate("/orders")} className="flex items-center gap-2 text-sm text-light hover:text-leaf mb-6 transition-colors">
          <ArrowLeftIcon className="size-4" /> Back to Orders
        </button>

        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1>Order #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-forest-300 text-sm mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: "long",
                day: "numeric",
                year: "numeric"
              })}
            </p>
          </div>
          <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
            order.status === "Delivered" ? "bg-forest-100 text-forest-700"
            : order.status === "Out for Delivery" ? "bg-leaf-100 text-leaf-700"
            : order.status === "Cancelled" ? "bg-tomato-100 text-tomato"
            : "bg-mango-100 text-mango-700"
          }`}>{order.status}</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            
            <OrderOTP order={order} />
            
            <LiveMap order={order} liveLocation={liveLocation} />
            
            <OrderTimeLine order={order} />
            
            {order?.deliveryPartner && order.status !== "Delivered" && order.status !== "Cancelled" && (
              <div className="bg-white rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-forest flex items-center justify-center text-white">
                    <span>{order.deliveryPartner.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal capitalize">{order.deliveryPartner.name}</p>
                    <p className="text-xs text-leaf capitalize">{order.deliveryPartner.vehicleType} ● Delivery Partner</p>
                  </div>
                </div>
                <a href={`tel:${order.deliveryPartner.phone}`} className="p-2.5 group bg-mist-300 rounded-xl hover:bg-charcoal transition-colors">
                  <PhoneIcon className="size-4 text-leaf group-hover:text-white" />
                </a>
              </div>
            )}
          </div>

          
          <div className="lg:col-span-4 space-y-5">
            
            <div className="bg-white rounded-2xl p-5">
              <h3 className="flex items-center gap-2 font-semibold text-leaf mb-2">
                <MapIcon className="size-4" />
                Delivery Address
              </h3>
              <p className="text-sm text-leaf leading-relaxed">
                {order?.shippingAddress.label}
                <br />
                {order?.shippingAddress.address}
                <br />
                {order?.shippingAddress.city}, {order?.shippingAddress.state}, {order?.shippingAddress.zip}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-leaf mb-3">Items ({order?.items.length})</h3>
              <div className="space-y-3">
                {order?.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate mb-1">{item.name}</p>
                      <p className="text-xs text-charcoal-400">X{item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold">
                      {(item.price * item.quantity).toFixed(2)} <span className="text-[16px] text-leaf">{currency}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-mist-200 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Subtotal</span>
                  <span>{order?.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-charcoal-500">Delivery</span>
                  <span>{order?.deliveryFee === 0 ? "Free" : `${order?.deliveryFee.toFixed(2)} ${currency}`}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-charcoal-500">Tax</span>
                  <span>{order?.tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-mist-200 font-semibold text-charcoal">
                  <span>Total</span>
                  <span>{order?.total.toFixed(2)} {currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;