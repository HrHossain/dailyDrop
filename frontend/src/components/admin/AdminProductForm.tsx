import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { categoriesData } from "../../assets/assets";
import Loading from "../../components/Loading";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../config/api";
import toast from "react-hot-toast";

export default function AdminProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = Boolean(id);

    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        image: "",
        category: "",
        unit: "",
        stock: "",
        isOrganic: false,
    });

   
    const { data: productResponse, isLoading } = useQuery({
        queryKey: ["product-detail", id],
        queryFn: async () => {
            const res = await api.get(`/products/${id}`);
            return res?.data?.data || res?.data;
        },
        enabled: isEdit,
    });

   
    useEffect(() => {
        if (productResponse && isEdit) {
            setFormData({
                name: productResponse.name || "",
                description: productResponse.description || "",
                price: productResponse.price.toString() || "",
                originalPrice: productResponse.originalPrice.toString() || "",
                image: productResponse.image || "",
                category: productResponse.category || "",
                unit: productResponse.unit || "",
                stock: productResponse.stock || "",
                isOrganic: productResponse.isOrganic || false,
            });
        }
    }, [productResponse, isEdit]);

    
    const mutation = useMutation({
        mutationFn: async (payload: any) => {
           
            if (isEdit) {
                const res = await api.put(`/products/${id}`, payload);

                return res.data.data;
            } else {
                const res = await api.post('/products', payload);
                return res.data.data;
            }
        },
        onSuccess: () => {
            toast.success(isEdit ? "Product updated successfully!" : "Product created successfully!");
            
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            navigate("/admin/products");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to save product!");
        }
    });

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        let finalImageUrl = formData.image;
        if(finalImageUrl){
            const formDataUpload = new FormData();
            formDataUpload.append("image",finalImageUrl)
            const {data} = await api.post('/upload',formDataUpload)
            finalImageUrl = data.url
        }
        if(!finalImageUrl){
            toast.error("Please upload a product image")
            return;
        }
        const submissionData = {
            ...formData,
            image:finalImageUrl,
            price: Number(formData.price),
            originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0,
            stock: Number(formData.stock),
        };

        mutation.mutate(submissionData);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-app-border overflow-hidden">
            <div className="px-6 py-5 border-b border-app-border flex items-center gap-4">
                <Link to="/admin/products" className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-lg transition-colors">
                    <ArrowLeftIcon className="size-5" />
                </Link>
                <h2 className="text-xl font-semibold text-zinc-900">{isEdit ? "Edit Product" : "New Product"}</h2>
            </div>
            {isLoading ? (
                <Loading />
            ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Name</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Category</label>
                            <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all bg-white">
                                <option value="">Select a category</option>
                                {categoriesData.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Price ($)</label>
                            <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Original Price ($) - Optional</label>
                            <input type="number" step="0.01" min="0" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Unit</label>
                            <input required type="text" placeholder="e.g., kg, piece, liter" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Stock</label>
                            <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Product Image URL / File</label>
                            <div className="flex items-center gap-4">
                                {(imageFile || formData.image) && (
                                    <div className="size-16 rounded-lg border border-zinc-200 overflow-hidden shrink-0 bg-app-cream">
                                        <img src={imageFile ? URL.createObjectURL(imageFile) : formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-app-orange file:text-white hover:file:bg-orange-600 cursor-pointer" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Description</label>
                            <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all resize-none" />
                        </div>
                        <div className="flex items-center gap-3">
                            <label htmlFor="isOrganic" className="text-sm font-medium text-zinc-700 cursor-pointer">Organic</label>
                            <input type="checkbox" id="isOrganic" checked={formData.isOrganic} onChange={e => setFormData({ ...formData, isOrganic: e.target.checked })} className="size-5 text-app-green rounded border-zinc-300 focus:ring-app-green cursor-pointer" />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-app-border flex justify-end">
                        <button disabled={mutation.isPending} type="submit" className="px-6 py-2.5 bg-mango text-leaf font-medium rounded-lg hover:text-charcoal transition-colors disabled:opacity-50">
                            {mutation.isPending ? "Saving..." : "Save Product"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}