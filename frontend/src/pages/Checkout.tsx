import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CarContext"
import { dummyAddressData } from "../assets/assets"
import { useState } from "react"

import { ArrowLeft, CheckIcon, ChevronRightIcon, CreditCardIcon, MapPinIcon } from "lucide-react"
import type { Address } from "../types"
import CheckoutAddress from "../components/Checkout/CheckoutAddress"
import CheckoutPayment from "../components/Checkout/CheckoutPayment"
import CheckoutReview from "../components/Checkout/CheckoutReview"

const Checkout = () => {
  const navigate = useNavigate()
  const currency = import.meta.env.VITE_CURRENCY || "taka"
  const {items,cartTotal} = useCart()
  const {user} = {user:{addresses:dummyAddressData}}
  const [step,setStep] = useState()
  const [loading,setLoading] = useState(false)
  const [address,setAddress] = useState<Address>({
    _id:"",
    label:"Home",
    address:"",
    city:"",
    state:"",
    zip:"",
    isDefault:false,
    lat:0,
    lng:0
  })

  const [paymentMethod,setPaymentMethod] = useState("card")
  const deliveryFee = cartTotal >= 2000 ? 150 : 0
   const tax = cartTotal * 0.08
   const total = cartTotal + deliveryFee + tax

   const steps:{key:string;label:string;icon: typeof MapPinIcon}[] = [
    {key:"address",label:"Address",icon:MapPinIcon},
    {key:"payment",label:"Payment",icon:CreditCardIcon},
    {key:"review",label:"Review",icon:CheckIcon},
   ]

  //  populate address from user's default address
  useState(()=>{
    if(user?.addresses?.length){
      const defaultAddr = user.addresses.find(a=>a.isDefault || user.addresses[0])
      setAddress({
        _id:defaultAddr?._id,
        label:defaultAddr?.label,
        address:defaultAddr?.address,
        city:defaultAddr?.city,
        state:defaultAddr?.state,
        zip:defaultAddr?.zip,
        isDefault:defaultAddr?.isDefault,
        lat:defaultAddr?.lat,
        lng:defaultAddr?.lng
      })
    }
  })

  if(items.length === 0){
    return (
      <div className="min-h-screen bg-mist flex-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-leaf mb-2">Your cart is empty</h2>
          <p className="text-sm text-light mb-4">Add some products to checkout</p>
          <button onClick={()=>navigate('/products')} className="px-5 py-2.5 bg-leaf text-white text-sm font-medium rounded-xl hover:bg-charcoal transition-colors">Browse Products</button>
        </div>
      </div>
    )
  }

   const handlePlaceOrder = async () =>{
    setLoading(true)
    navigate("/orders")
   }
  return (
    <div className="min-h-screen bg-mist-200 ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={()=>navigate(-1)} className="flex flex-center gap-2 text-sm text-light hover:text-leaf mb-6 transition-colors"><ArrowLeft className="size-4"/>Back</button>
        <h1 className="text-2xl font-semibold text-leaf mb-8">Checkout</h1>
        {/* step */}

        <div className="flex items-center gap-2 mb-8">
          {
            steps.map((s,i)=>(
              <div key={s.key} className="flex items-center gap-2">
                <button onClick={()=>setStep(s.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${step === s.key ? "bg-leaf text-white":"bg-white text-light"}`}>
                  <s.icon className="sixe-4"/> {s.label}
                  {i < steps.length -1 && <ChevronRightIcon className="size-4 text-light"/>}
                </button>
              </div>
            ))
          }
        </div>
          <div className="grid md:grid-cols-3 gap-6">

            {/* main form */}
            <div className="md:col-span-2">
              {step === "address" && <CheckoutAddress address={address} setAddress={setAddress} setStep={setStep} user={user}/>}

              {step === "payment" && <CheckoutPayment paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} setStep={setStep} />}

              {step === "review" && <CheckoutReview address={address} items={items} handlePlaceOrder={handlePlaceOrder} loading={loading} total={total}/>}

            </div>

            {/* order summary sidebar */}
            <div className="bg-white rounded-2xl p-5 h-fit sticky top-24">
              <h3 className="text-base font-semibold text-charcoal mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{cartTotal.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? <span className="text-mango">Free</span> :   deliveryFee.toFixed(2) + " " + currency}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{tax.toFixed(2)} {currency}</span>
                </div>
              <div className="w-full h-0.5 bg-mist-500"/>
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{total.toFixed(2)} {currency}</span>
                </div>
              </div>
            </div>
          </div>




      </div>
    </div>
  )
}

export default Checkout