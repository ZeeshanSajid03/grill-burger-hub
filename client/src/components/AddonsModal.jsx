import { useState } from 'react'

export default function AddonsModal({ item, onConfirm, onClose }) {
  const [selectedAddons, setSelectedAddons] = useState([])

  const toggleAddon = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.name === addon.name)
      if (exists) return prev.filter(a => a.name !== addon.name)
      return [...prev, addon]
    })
  }

  const isSelected = (addon) => selectedAddons.some(a => a.name === addon.name)

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0)
  const grandTotal  = item.price + addonsTotal

  const handleConfirm = () => {
    onConfirm(item, selectedAddons)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md pointer-events-auto">

          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-zinc-800">
            <div className="flex gap-4 items-center">
              {/* Item image or emoji */}
              <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                  : <span className="text-3xl">
                      {item.category === 'Burger' ? '🍔' :
                       item.category === 'Fries'  ? '🍟' :
                       item.category === 'Drink'  ? '🥤' : '🎁'}
                    </span>
                }
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">{item.name}</h3>
                <p className="text-orange-400 font-medium">Rs. {item.price}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white text-2xl leading-none ml-4 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Add-ons list */}
          <div className="p-6">
            <p className="text-zinc-400 text-sm font-medium mb-4">
              Make it a meal — add extras:
            </p>
            <div className="space-y-3">
              {item.addons.map((addon, i) => (
                <button
                  key={i}
                  onClick={() => toggleAddon(addon)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left
                    ${isSelected(addon)
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                      ${isSelected(addon)
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-zinc-600'
                      }`}
                    >
                      {isSelected(addon) && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-white text-sm font-medium">{addon.name}</span>
                  </div>
                  <span className={`text-sm font-bold transition-colors
                    ${isSelected(addon) ? 'text-orange-400' : 'text-zinc-400'}`}>
                    + Rs. {addon.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 space-y-3">
            {/* Price breakdown */}
            {selectedAddons.length > 0 && (
              <div className="bg-zinc-800 rounded-xl px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">{item.name}</span>
                  <span className="text-white">Rs. {item.price}</span>
                </div>
                {selectedAddons.map((a, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{a.name}</span>
                    <span className="text-white">Rs. {a.price}</span>
                  </div>
                ))}
                <div className="border-t border-zinc-700 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-orange-400">Rs. {grandTotal}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleConfirm}
              className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Add to Cart · Rs. {grandTotal}
            </button>

            <button
              onClick={() => { onConfirm(item, []); onClose() }}
              className="w-full text-zinc-500 hover:text-zinc-300 text-sm py-2 transition-colors"
            >
              Add without extras
            </button>
          </div>
        </div>
      </div>
    </>
  )
}