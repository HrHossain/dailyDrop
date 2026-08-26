import { Outlet } from "react-router-dom"
import Banner from "../components/Banner"
import Navber from "../components/Navber"
import Footer from "../components/Footer"
import CartSidebar from "../components/CartSidebar"


const AppLayout = () => {
  return (
    <>
    <Banner/>
    <Navber/>
    <main className="min-h-screen">
        <Outlet/>
    </main>
    <Footer/>
    <CartSidebar/>
    </>
  )
}

export default AppLayout