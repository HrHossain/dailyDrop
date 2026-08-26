import { XIcon } from 'lucide-react'

const AddressForm = ({resetForm,handleSubmit,form,setForm,editingId}:any) => {
  return (
   <>
    <div className='fixed inset-0 bg-black/40 z-50'/>
    {/* form container */}
        <div  onClick={resetForm} className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  z-50 flex-center p-4 min-w-md'>
            <form onClick={e => e.stopPropagation()} onSubmit={handleSubmit} className='bg-white rounded-2xl p-6 w-full max-w-lg animate-fade-in'>
                {/* form header */}

                <div className='flex items-center justify-between mb-5'>
                    <h2>{editingId ? "Edit Address" : "Add New Address"}</h2>
                    <button type='button' onClick={resetForm} className='p-2 hover:bg-mist-300 rounded-lg'>
                        <XIcon className='size-5'/>
                    </button>
                </div>
                {/* form input fields */}
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-medium text-charcoal mb-1.5' htmlFor='label'>Label</label>
                    <input onChange={e => setForm({...form,label:e.target.value})} value={form.label} type='text' id='label' placeholder='Home, Work, etc.' className='w-full px-4 py-2.5 text-sm rounded-xl border border-leaf focus:charcoal outline-none' required/>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-charcoal mb-1.5' htmlFor='streetAddr'>Street Address</label>
                    <input onChange={e => setForm({...form,address:e.target.value})} value={form.address} type='text' id='streetAddr' placeholder='Street address' className='w-full px-4 py-2.5 text-sm rounded-xl border border-leaf focus:charcoal outline-none' required/>
                    </div>

                  <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <label className='block text-sm font-medium text-charcoal mb-1.5' htmlFor='city'>City</label>
                    <input onChange={e => setForm({...form,city:e.target.value})} value={form.city} type='text' id='city' placeholder='Your city' className='w-full px-4 py-2.5 text-sm rounded-xl border border-leaf focus:charcoal outline-none' required/>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-charcoal mb-1.5' htmlFor='state'>State</label>
                    <input onChange={e => setForm({...form,state:e.target.value})} value={form.state} type='text' id='state' placeholder='Your state' className='w-full px-4 py-2.5 text-sm rounded-xl border border-leaf focus:charcoal outline-none' required/>
                    </div>
                  </div>

                 <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <label className='block text-sm font-medium text-charcoal mb-1.5' htmlFor='zip'>ZIP code</label>
                    <input onChange={e => setForm({...form,zip:e.target.value})} value={form.zip} type='text' id='zip'  className='w-full px-4 py-2.5 text-sm rounded-xl border border-leaf focus:charcoal outline-none' required/>
                    </div>

                    <div className='flex items-end pb-1'>
                        <label className='flex items-center gap-2 cursor-pointer' >
                            <input type='checkbox' checked={form.isDefault} onChange={e =>setForm({...form,isDefault:e.target.value})}/>
                            <span className='text-sm text-charcoal'>Set as default</span>
                        </label>
                    
                    </div>
                  </div>

                </div>
                <button className='w-full py-2 text-mist bg-leaf mt-6  font-semibold rounded-xl hover:bg-charcoal' type='submit'>{
                    editingId ? "Edit Address" : "Save Address"}</button>
                
            </form>
        </div>
   </>
  )
}

export default AddressForm