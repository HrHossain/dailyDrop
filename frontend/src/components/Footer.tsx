import { BikeIcon, CarIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { footerData } from "../assets/assets"


const Footer = () => {
  return (
    <footer className="bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* top */}
            <div className="grid grid-cols md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <Link to='/' className="flex items-center gap-2 mb-4">
                    <CarIcon className="font-bold text-white" size={24}/> 
                    <span className="text-[22px] font-sans text-white">{footerData.brand.name}</span>
                    </Link>
               
                <p className="text-sm text-white/70 mb-4">{footerData.brand.description}</p>

                <div className="flex gap-3">
                    {
                        footerData.brand.socials.map((social,i)=>(
                            <a key={i} href={social.link} className="size-9 rounded-lg bg-leaf-200 flex-center border 
                            hover:bg-white/2 hover:border-white">
                                <social.icon className="size-4"/>
                            </a>
                        ))
                    }
                </div>
                 </div>

                 {
                    footerData.sections.map((section,i)=>(
                        <div key={i}>
                            <h3 className="text-sm font-semibold uppercase mb-4 text-white">
                                {section.title}
                            </h3>
                            <ul className="space-y-2.5">
                                {
                                    section.links.map((link,i)=>(
                                        <li key={i}>
                                            {
                                                link.to? (
                                                    <Link to={link.to} className="text-sm text-white/70 hover:text-white">
                                                        {link.label}
                                                    </Link>
                                                ):(
                                                    <a href={link.href} className="text-sm text-white/70 hover:text-white">{
                                                        link.label
                                                    }</a>
                                                )
                                            }
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>

                    ))
                 }

                 {/* contact */}
                 <div>
                    <h3 className="text-sm font-semibold uppercase mb-4 text-white">Contact Us</h3>
                    <ul className="space-y-3">
                        {
                            footerData.contact.map((item,i)=>{
                                const Icon = item.icon
                                return(
                                    <li key={i} className="flex gap-3 text-sm text-white/70">
                                        <Icon className="size-4 text-white"/>
                                    {
                                        item.text
                                    }
                                    </li>
                                )
                            })
                        }
                    </ul>
                 </div>

            </div>
            {/* bottom */}
            <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-white/50">
                    {footerData.bottom.copyright}
                </p>
                <div className="flex gap-4">
                    {footerData.bottom.links.map((link,i)=>(
                        <a key={i} href={link.href} className="text-xs text-white/50 hover:text-white/70">{link.label}</a>
                    ))}
                </div>
            </div>
        </div>
    </footer>
  )
}

export default Footer