import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token && token !== 'undefined' ? { Authorization: `Bearer ${token}` } : {};
};

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Login failed" };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Registration failed" };
  }
};

export async function getUsers() {
  return axios
    .get(`${API_URL}/auth/users`, { headers: getAuthHeader() })
    .then((response) => response.data);
}

export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`, { headers: getAuthHeader() });
    
    const products = response.data.data || [];
    return products.map((product, i) => ({
      ...product,
      isCheapest: !products.some((p, j) => i !== j && p.price < product.price),
      moreExpensiveCount: products.filter(p => p.price > product.price).length
    }));
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
};

export const createProduct = async (productData) => {
  const response = await axios.post(`${API_URL}/products`, productData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};