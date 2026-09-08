import React, { useEffect, useState } from 'react';
import type { Address } from '../types';
import { MapPinIcon, PlusIcon } from 'lucide-react';
import Loading from '../components/Loading';
import AddressCard from '../components/Address/AddressCard';
import AddressForm from '../components/Address/AddressForm';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { addressSchema } from '../validation/addressValidation';
import toast from 'react-hot-toast';

const Addresses = () => {
  const { updateUser } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    isDefault: false,
  });


  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/address/');
      const addressData = res.data?.data || [];
      setAddresses(addressData);
      updateUser({addresses})
    } catch (error) {
      toast.error('Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setForm({ label: '', address: '', city: '', state: '', zip: '', isDefault: false });
    setShowForm(false);
    setEditingId(null);
  };

  
  const getUserCoordinates = (): Promise<{ lat: number | null; lng: number | null }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: null, lng: null });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation permission denied or error:', error.message);
          resolve({ lat: null, lng: null });
        },
        { timeout: 10000 }
      );
    });
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
      const coords = await getUserCoordinates();

     
      const rawData = {
        ...form,
        lat: coords.lat,
        lng: coords.lng,
      };
      const validationResult = addressSchema.safeParse(rawData);
      if (!validationResult.success) {
      toast.error("Validation failed! Please check your input.");
      return;
    }

    const payload = validationResult.data;
    console.log('Submitting address:', payload, 'Editing ID:', editingId);

      if (editingId) {
        await api.put(`users/address/${editingId}`, payload);
      } else {
        await api.post('users/address', payload);
      }

      resetForm();
      fetchAddresses();
    } catch (err: any) {
      console.error('Failed to save address', err);
      toast.error('Something went wrong while saving address');
    }
  };

 
  const onEditHandler = (add: Address) => {
    setForm({
      label: add.label,
      address: add.address,
      city: add.city,
      state: add.state,
      zip: add.zip,
      isDefault: add.isDefault,
    });

    setEditingId(add.id);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-mist-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-semibold text-[34px] text-charcoal">My Addresses</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-charcoal text-mist text-sm font-semibold rounded-sm hover:text-mist-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" /> Add Address
          </button>
        </div>

        
        {showForm && (
          <AddressForm
            resetForm={resetForm}
            handleSubmit={handleSubmit}
            form={form}
            setForm={setForm}
            editingId={editingId}
          />
        )}

        
        {loading ? (
          <Loading />
        ) : addresses.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-center py-16 bg-white rounded-lg shadow-sm">
            <MapPinIcon className="size-16 text-leaf-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-charcoal">No addresses saved</h2>
            <p className="text-sm text-charcoal-500">Add an address for faster checkout</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                addr={addr}
                onEditHandler={onEditHandler}
                setAddresses={setAddresses}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;