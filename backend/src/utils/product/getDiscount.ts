interface ProductPriceInput{
    originalPrice?:number | null;
    price?:number | null
}
export function getDiscount(product:ProductPriceInput):number | null{
    const originalPrice = product.originalPrice || 0;
        const currentPrice = product.price || 0;

        // Prevent division by zero and negative discounts
        const discount = originalPrice > 0 && originalPrice > currentPrice
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : 0;

           
            return discount > 0 ? discount : null 
}