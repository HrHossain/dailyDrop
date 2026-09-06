import { CheckIcon, MapIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { Address } from "../../types";
import api from "../../config/api";
import { toast } from "react-hot-toast/headless";
import type { AxiosResponse } from "axios";

interface AddressCardProps {
    addr: Address;
    onEditHandler: (addr: Address) => void;
    setAddresses: React.Dispatch<React.SetStateAction<Address[]>>; 
}


const AddressCard = ({ addr, onEditHandler, setAddresses }: AddressCardProps) => {
    const handleDelete = async (id: string): Promise<void> => {
        try {
            const res: AxiosResponse = await api.delete(`/users/address/${id}`);
            
            if (res.status === 200) {
               
                setAddresses(prevAddresses => 
                    prevAddresses.filter(address => address.id !== id)
                );
            }
        } catch (error) {
            toast.error('Failed to delete address');  
        }
    };

    return (
        <div className="max-w-3xl bg-white rounded-2xl p-6 flex items-start justify-between">
            {/* left */}
            <div className="flex gap-4">
                <div className="flex-center size-10 rounded-xl bg-mist flex-center shrink-0">
                    <MapIcon className="size-5 text-leaf" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-charcoal">{addr.label}</p>
                        {addr.isDefault && (
                            <span className="flex-center gap-1 px-2.5 py-0.5 text-[10px] font-medium bg-leaf text-white rounded-full">
                                <CheckIcon className="size-2.5" /> {/* ✅ className ঠিক করা */}
                                Default
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-light">
                        {addr.address}, {addr.city}, <br />
                        {addr.state}, {addr.zip}
                    </p>
                </div>
            </div>

            {/* right - action buttons */}
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => onEditHandler(addr)} 
                    className="p-2 hover:text-leaf hover:bg-mist-300 bg-mist-200 transition-colors rounded-lg" // ✅ rounded যোগ করা
                >
                    <PencilIcon className="size-4 text-light" />
                </button>

                <button 
                    onClick={() => handleDelete(addr.id)} 
                    className="p-2 hover:text-red-500 hover:bg-red-50 bg-mist-200 transition-colors rounded-lg" // ✅ ডিলিটের জন্য আলাদা স্টাইল
                >
                    <Trash2Icon className="size-4 text-light" />
                </button>
            </div>
        </div>
    );
};

export default AddressCard;