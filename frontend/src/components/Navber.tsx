import { ArrowUpRightIcon, CarIcon, ChevronDownIcon, LogOutIcon, MapPinIcon, MenuIcon, PackageIcon, SearchIcon, ShieldIcon, ShoppingCart, UserIcon, XIcon } from "lucide-react";
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CarContext";
import { useAuth } from "../context/AuthContext";


const Navber = () => {
    const {user,logout} = useAuth()
    
    const {cartCount , setIsCartOpen} = useCart()
    
    const [searchQuery,setSearchQuery] = useState("");
    const [userMenuOpen,setUserMenuOpen] = useState(false);
    const navigate = useNavigate()

    const handleSearch = (e:React.SubmitEvent)=>{
        e.preventDefault()
        if(searchQuery.trim()){
            navigate(`products/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery("")
        }
    }
    const handleLogout = ()=>{
        logout()
        setUserMenuOpen(false)
        navigate("/")
    }
    console.log(user)
  return (
    <nav className="bg-mist sticky top-0 z-50 border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to='/' className="flex items-center gap-2 text-[22px] font-bold shrink-0 font-sans text-black">
            <CarIcon className="font-bold" size={24}/> <span>DailyDrop</span>
            </Link>
            <div className=" font-display  hidden md:flex items-center gap-6 text-[clamp(0.875rem,0.5vw+0.75rem,1rem)]">
                <Link className="text-charcoal hover:text-mango" to="/">Home</Link>
                <Link className="text-charcoal hover:text-mango" to="/products">Products</Link>
                <Link  to="/deals" className="text-mango">Deals</Link>
            </div>
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm text-xs sm:text-sm">
                <div className="relative w-full">
                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500"/>
                    <input 
                    type="search" 
                    placeholder="Search for groceries"
                    value={searchQuery}
                    onChange={(e)=>setSearchQuery(e.target.value)}
                    className="w-full pl-8 p-2 bg-mango-100 rounded-full ring ring-mango-500/15 focus:ring-mango-500/30"
                    />
                </div>
            </form>

            {/* right action */}
            <div className="flex items-center gap-3">
                {/* cart */}
                <button className="relative p-2 rounded-xl" onClick={()=>setIsCartOpen(true)}>
                    <ShoppingCart className="size-5 text-charcoal"/>
                    {cartCount > 0 && <span className="absolute -top-1 -right-1 size-4 bg-mango text-charcoal text-[10px] rounded-full flex-center">{cartCount}</span>}
                </button>
                {/* user */}
                <div className="relative">
                    {
                        user? (
                            <button onClick={()=>setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2">
                                <div className="size-7 rounded-full bg-green-950 text-white flex-center font-display">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <ChevronDownIcon className="size-3 text-zinc-500"/>
                            </button>
                        ):(
                            <div className="flex-center gap-2">
                                <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-950 rounded-full hover:bg-green-950-light transition-colors">
                                    <UserIcon size={16}/> sign in
                                </Link>
                                {
                                    userMenuOpen ? <XIcon className="md:hidden" onClick={()=> setUserMenuOpen(!userMenuOpen)}/> : 
                                    <MenuIcon className="md:hidden" onClick={()=>setUserMenuOpen(!userMenuOpen)}/>
                                }
                            </div>
                        )
                    }
                    {
                        userMenuOpen && (
                            <div className=" inset-0 z-40" onClick={()=>setUserMenuOpen(false)}>
                                <div className="absolute mt-2.5 right-0  w-56 bg-mist rounded-xl shadow-lg border border-[#e5e7eb] py-2 z-50 animate-fade-in">
                                    {
                                        user && (
                                            <div className="px-4 py-2 border-b border-[#e5e7eb]">
                                                <p className="text-sm font-medium text-charcoal">{user?.name}</p>
                                                <p className="text-xs text-charcoal">{user?.email}</p>
                                            </div>
                                        )
                                    }

                                    <div onClick={()=>setUserMenuOpen(false)}>
                                        {!user && <Link className="dropdown-link" to='/login'><UserIcon size={16}/>Sign In</Link>}

                                         {user && <Link className="dropdown-link" to='/orders'><PackageIcon size={16}/>My Orders</Link>}

                                          {user && <Link className="dropdown-link" to='/addresses'><MapPinIcon size={16}/>Addresses</Link>}

                                            <Link className="dropdown-link md:hidden" to='/products'><ArrowUpRightIcon size={16}/>Products</Link>

                                         <Link className="dropdown-link md:hidden" to='/deals'><ArrowUpRightIcon size={16}/>Deals</Link>

                                         {
                                            user?.isAdmin && (
                                                <Link to='/admin/products'
                                                className="dropdown-link">
                                                
                                                    <ShieldIcon className="text-dark" size={16}/>
                                                    <span className="text-dark">
                                                        Admin Panel
                                                    </span>
                                                </Link>
                                            )
                                         }
                                         {
                                            user && (
                                                <div>
                                                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-600 hover:bg-red-50 w-full transition-colors">
                                                        <LogOutIcon/> 
                                                        <span className="text-red-700">
                                                        Log Out
                                                    </span>
                                                    </button>
                                                </div>
                                            )
                                         }
                                    </div>
                                </div>

                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    </nav>
  )
}

export default Navber