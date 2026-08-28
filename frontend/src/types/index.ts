export interface Product {
  id: string;
  title: string;
  price: number;
  description?: string;
  image: string;
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: 'foxpost' | 'home_delivery';
  foxpost_place_id?: string;
  foxpost_place_name?: string;
  foxpost_place_address?: string;
  shipping_address?: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
  }>;
  total_price: number;
  status: 'pending';
}