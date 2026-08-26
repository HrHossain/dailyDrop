import { Toaster } from "react-hot-toast"
import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import AppLayout from "./pages/AppLayout"
import Products from "./pages/Products"
import ProductPage from "./pages/ProductPage"
import SearchResult from "./pages/SearchResult"
import FlashDeals from "./pages/FlashDeals"
import Checkout from "./pages/Checkout"
import Home from "./pages/Home"
import MyOrders from "./pages/MyOrders"
import OrderTracking from "./pages/OrderTracking"
import Addresses from "./pages/Addresses"
import ProtectedRoute from "./pages/ProtectedRoute"
import AdminLayout from "./components/admin/AdminLayout"
import AdminDashboard from "./components/admin/AdminDashboard"
import AdminProducts from "./components/admin/AdminProducts"
import AdminProductForm from "./components/admin/AdminProductForm"
import AdminOrders from "./components/admin/AdminOrders"
import DeliveryLogin from "./components/Delivery/DeliveryLogin"
import DeliveryLayout from "./components/Delivery/DeliveryLayout"
import DeliveryDashboard from "./components/Delivery/DeliveryDashboard"
import AdminDeliveryPartners from "./components/admin/AdminDeliveryPartners"
function App() {
  

  return (
    <>
  <Toaster position="top-right" toastOptions={{
    duration:3000,
    style:{
      background:"#1B3022",
      color:"#fff",
      borderRadius:"12px",
      fontSize:"14px"
    }
  }}/>
         
         <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/" element={<AppLayout/>}>
              <Route index  element={<Home/>}/>
              <Route path="products" element={<Products/>}/>
              <Route path="products/:id" element={<ProductPage/>}/>
              <Route path="search" element={<SearchResult/>}/>
              <Route path="deals" element={<FlashDeals/>}/>
              <Route element={<ProtectedRoute/>}>
                <Route path="checkout" element={<Checkout/>}/>
                <Route path="orders" element={<MyOrders/>}/>
                <Route path="orders/:id" element={<OrderTracking/>}/>
                <Route path="addresses" element={<Addresses/>}/>
              </Route>
          </Route>
          {/* admin pages */}

          <Route path="/admin" element={<AdminLayout/>}>
            <Route index element={<AdminDashboard/>}/>
            <Route path="products" element={<AdminProducts/>}/>
            <Route path="products/new" element={<AdminProductForm/>}/>
            <Route path="products/:id/edit" element={<AdminProducts/>}/>
            <Route path="orders" element={<AdminOrders/>} />
            <Route path="delivery-partners" element={<AdminDeliveryPartners/>} />
          </Route>

          {/* delivery partner  */}

          <Route path="/delivery/login" element={<DeliveryLogin/>}/>
            <Route path="/delivery" element={<DeliveryLayout/>}>
              <Route index element={<DeliveryDashboard/>}/>
            </Route>
            
            
         
         </Routes>
    </>
  )
}

export default App
