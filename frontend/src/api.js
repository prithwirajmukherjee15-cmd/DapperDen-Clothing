import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
});

export const receiptUrl = (orderId, phone) =>
  `${API}/orders/receipt?${new URLSearchParams({ order_id: orderId, phone })}`;

export default api;
