import api from '../config/api';
export async function fetchPopularProducts(url: string): Promise<any> {
  try {
    const response = await api.get(url);
    return response;
  } catch (error) {
    throw error;
  }
}