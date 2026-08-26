import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CarContext"
import { ArrowRightIcon, MinusIcon, PlusIcon, ShoppingBag, ShoppingBagIcon, Trash2Icon, XIcon } from "lucide-react"

const CartSidebar = () => {
    const {
        items,
        removeFromCart,
        updateQuantity,
        cartTotal,
        isCartOpen,
        setIsCartOpen
    } = useCart()

    const navigate = useNavigate()

    if (!isCartOpen) return null;

    const deliveryFee = cartTotal > 2000 ? 0 : 150;
    const grandTotal = cartTotal + deliveryFee

    return (
        <>
            {/* Backdrop */}
            <div onClick={() => setIsCartOpen(false)} className="fixed inset-0  z-50 transition-opacity" />
            
            {/* Sidebar Container */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-mist-200 z-50 shadow-2xl flex flex-col animate-slide-in-right">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-leaf/60">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="size-5" />
                        <h2 className="text-lg font-medium">Your Cart</h2>
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-mist-300">{items.length} items</span>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-xl hover:bg-mist-300 transition-colors">
                        <XIcon className="size-5" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingBagIcon className="size-16 text-charcoal/40 mb-4" />
                            <h3 className="text-lg font-medium mb-1 text-charcoal">Your cart is empty</h3>
                            <p className="text-sm text-charcoal/60">Add items to get started!</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.product._id} className="flex gap-3 bg-white rounded-xl p-3 shadow-sm">
                                <img src={item.product.image} alt={item.product.name} className="size-16 rounded-xl object-cover shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold truncate text-charcoal">{item.product.name}</h4>
                                    <p className="text-xs text-leaf mt-0.5">
                                        ৳{item.product.price.toFixed(2)} / {item.product.unit}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mt-2">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)} 
                                                className="size-7 rounded-lg bg-mist-100 border border-mist-300 flex items-center justify-center hover:bg-mist-200 transition-colors"
                                            >
                                                <MinusIcon className="size-3" />
                                            </button>
                                            <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)} 
                                                className="size-7 rounded-lg bg-mist-100 border border-mist-300 flex items-center justify-center hover:bg-mist-200 transition-colors"
                                            >
                                                <PlusIcon className="size-3" />
                                            </button>
                                        </div>

                                        {/* Price & Delete */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-charcoal">
                                                ৳{(item.product.price * item.quantity).toFixed(2)}
                                            </span>
                                            <button 
                                                onClick={() => removeFromCart(item.product._id)} 
                                                className="text-leaf hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2Icon className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer (Placed outside the item map so it stays sticky at the bottom) */}
                {items.length > 0 && (
                    <div className="p-5 border-t border-leaf/30 bg-white space-y-3 shadow-lg">
                        <div className="flex justify-between text-sm">
                            <span className="text-leaf">Subtotal</span>
                            <span className="font-medium text-charcoal">{cartTotal.toFixed(2)} tk</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-leaf">Delivery</span>
                            <span className="font-medium text-charcoal">
                                {deliveryFee === 0 ? (
                                    <span className="text-leaf font-semibold">Free</span>
                                ) : (
                                    `${deliveryFee.toFixed(2)} tk`
                                )}
                            </span>
                        </div>

                        {deliveryFee > 0 && (
                            <p className="text-xs text-charcoal/70 text-center bg-mist-100 py-1 rounded-md">
                                Add ৳{(2000 - cartTotal).toFixed(2)} more for free delivery
                            </p>
                        )}

                        <div className="flex justify-between text-base font-semibold border-t border-leaf/30 pt-3">
                            <span>Total</span>
                            <span>{grandTotal.toFixed(2)} tk</span>
                        </div>

                        <button
                            onClick={() => {
                                setIsCartOpen(false);
                                navigate('/checkout');
                                window.scrollTo(0, 0);
                            }}
                            className="w-full py-3 bg-tomato text-white font-semibold rounded-xl hover:bg-tomato/90 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            Proceed to Checkout <ArrowRightIcon className="size-4" />
                        </button>
                    </div>
                )}

            </div>
        </>
    )
}

export default CartSidebar