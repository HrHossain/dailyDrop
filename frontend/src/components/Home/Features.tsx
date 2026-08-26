
import { heroSectionData } from '../../assets/assets'

const Features = () => {
  return (
    <section className='bg-mist-200 py-5
     border border-[#e5e7eb] rounded-xl'>
        <div className='mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols md:grid-cols-4 gap-4'>
                {
                    heroSectionData.hero_features.map((feat,i)=>(
                        <div key={i} className='flex items-center gap-3 py-3'>
                            <div className='size-10 rounded-lg bg-mist flex-center shrink-0'>
                                <feat.icon className='size-5 text-leaf'/>
                            </div>
                            <div>
                                <p className='text-sm font-semibold text-leaf'>{feat.title}</p>
                                <p className='text-xs text-leaf-200'>{feat.desc}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
        
    </section>
  )
}

export default Features