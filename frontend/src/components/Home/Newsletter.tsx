import { MailIcon } from "lucide-react"

const Newsletter = () => {
  return (
    <section className='bg-white py-18 px-4 sm:px-6 lg:px-8 rounded-3xl mx-auto shadow-xs mt-32 mb-20'>
        <div className='max-w-2xl mx-auto text-center'>
           <div className="size-16 bg-white rounded-xl flex-center mx-auto mb-6 shadow">
                <MailIcon className="size-8 text-leaf" strokeWidth={1.5}/>
           </div>
           <h2 className="text-3xl font-semibold text-charcoal mb-4">Subscribe to our Newsletter</h2>
           <p className="text-charcoal mb-8 text-base">One email a week. Zero fluff. Just what's fresh, what's in season, and what's worth adding to your cart.</p>

           <form onSubmit={(e)=>{e.preventDefault()}}>
            <input type="email" placeholder="Enter your email address" required className="w-full md:w-[50%] flex-1 px-5 py-3.5 rounded-xl border border-[#e5e7eb] focus:border:leaf focus:ring bg-white text-sm transition-all"/>
            <button type="submit" className="px-8 py-3.5 bg-charcoal text-white font-semibold rounded-xl hover:bg-leaf-700 transition-colors shadow-sm whitespace-nowrap active:scale-[0.98] m-2 ">Subscribe</button>
           </form>
        </div>
    </section>
  )
}

export default Newsletter