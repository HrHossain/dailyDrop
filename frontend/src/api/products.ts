import api from '../config/api';
export async function fetchPopularProducts(url: string): Promise<any> {
  try {
    const response = await api.get(url);
    return response;
  } catch (error) {
    throw error;
  }
}

export const fetchSearchResults = async (searchTerm: string) => {
  if (!searchTerm.trim()) return [];
  const response = await api.get(`/products/search?q=${encodeURIComponent(searchTerm)}`);
  return response.data; 
};