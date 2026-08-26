import { TruckIcon, XIcon, ZapIcon } from "lucide-react"
import { useState } from "react"


const Banner = () => {
    const [bannerVisible,setBannerVisible] = useState(()=>{
        return sessionStorage.getItem('banner_dismissed') !== "true"
    })

    const dismissBanner = ()=>{
        setBannerVisible(false)
        sessionStorage.setItem("banner_dismissed",'true')
    }
  return (
    <section>
        {
            bannerVisible && (
                <div className="bg-linear-to-r from-charcoal via-emerald-800 to-charcoal text-white text-xs sm:text-sm relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-4 py-2 flex-center gap-6">
                        <div className="flex-center gap-2">
                            <TruckIcon className="size-4 shrink-0"/>
                            <span className="font-medium font-display">Free delivery on orders above 150 ৳</span>
                        </div>
                        <span className="hidden sm:inline text-white/50">|</span>
                        <div className="hidden sm:flex items-center gap-2">
                            <ZapIcon className="size-3.5 fill-yellow-400 text-mango-400 shrink-0"/>
                            <span className="font-medium font-display">Authentic fresh product delivered daily</span>
                        </div>
                    </div>
                    <button onClick={dismissBanner} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-leaf rounded-full transition-colors">
                        <XIcon className="size-3.5"/>
                    </button>
                </div>
            )
        }
    </section>
  )
}

export default Banner