import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
    const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice } = useCart()
    const navigate = useNavigate()

    if (!isCartOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-lg font-bold">Your Order</h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="text-zinc-400 hover:text-white text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center text-zinc-500 mt-20">
                            <p className="text-4xl mb-3">🛒</p>
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.cartKey} className="flex items-start gap-4 bg-zinc-800 rounded-xl p-4">
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{item.name}</p>
                                    {item.selectedAddons?.length > 0 && (
                                        <p className="text-zinc-500 text-xs mt-0.5">
                                            + {item.selectedAddons.map(a => a.name).join(', ')}
                                        </p>
                                    )}
                                    <p className="text-orange-400 text-sm mt-1">Rs. {item.price}</p>
                                </div>

                                {/* Quantity controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                                        className="w-7 h-7 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-sm"
                                    >−</button>
                                    <span className="w-4 text-center text-sm">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                                        className="w-7 h-7 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-sm"
                                    >+</button>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.cartKey)}
                                    className="text-zinc-500 hover:text-red-400 text-lg ml-2"
                                >×</button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-6 border-t border-zinc-800 space-y-4">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-orange-400">Rs. {totalPrice}</span>
                        </div>
                        <button
                            onClick={() => { setIsCartOpen(false); navigate('/checkout') }}
                            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}