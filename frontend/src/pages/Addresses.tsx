import React, { useEffect, useState } from 'react'
import type{ Address } from '../types'
import { dummyAddressData } from '../assets/assets'
import { MapPinIcon, PlusIcon } from 'lucide-react'
import Loading from '../components/Loading'
import AddressCard from '../components/Address/AddressCard'
import AddressForm from '../components/Address/AddressForm'

const Addresses = () => {
  const [addresses,setAddresses] = useState<Address[]>([])
  const [loading,setLoading] = useState<Boolean>(true)
  const [showForm,setShowForm] = useState<Boolean>(false)
  const [editingId,setEditingId] = useState<string | null >(null)
  const [form,setForm] = useState({label:"",address:"",city:"",state:"",zip:"",isDefault:false})

  const resetForm = ()=>{
    setForm({label:"",address:"",city:"",state:"",zip:"",isDefault:false})
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = async (e:React.SubmitEvent) =>{
    e.preventDefault()
  }
  const onEditHandler = (add:Address) =>{
    setForm({
      label:add.label,
      address:add.address,
      city:add.city,
      state:add.state,
      zip:add.zip,
      isDefault:add.isDefault
    })

    setEditingId(add._id);
    setShowForm(true)
  }
  useEffect(()=>{
    setAddresses(dummyAddressData)
    setTimeout(()=>setLoading(false),1000)
  },[])
  return (
    <div className="min-h-screen bg-mist-200">
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* page header */}
        <div className='flex items-center justify-between mb-8'>
          <h1 className='font-semibold text-[34px] text-charcoal'>My Addresses</h1>
          <button onClick={()=>{resetForm();setShowForm(true)}} className='px-4 py-2 bg-charcoal text-mist text-sm font-semibold rounded-sm hover:text-mist-300 transition-colors flex items-center'><PlusIcon/>Add Address</button>
        </div>

        {/* form modal */}
          {showForm && <AddressForm resetForm={resetForm} handleSubmit={handleSubmit} form={form} setForm={setForm} editingId={editingId}/>}
        {/* address list */}
        {
          loading ? (<Loading/>): addresses.length === 0 ? (
          <div className='h-[600px] flex flex-col items-center justify-center text-center py-16'>
            <MapPinIcon className='size-16 text-leaf-300 mx-auto mb-4'/>
            <h2 className='tex-lg'>No addresses saved</h2>
            <p className='text-sm'>Add an address for faster checkout</p>
          </div>) : (<div className='space-y-4'>
            {
              addresses.map((addr)=>(
                <AddressCard key={addr._id} addr={addr} onEditHandler={onEditHandler} setAddresses={setAddresses}/>
              ))
            }
          </div>)
        }
      </div>
    </div>
  )
}

export default Addresses