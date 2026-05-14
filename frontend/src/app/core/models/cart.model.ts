export interface CartItem {
  id: number;
  productId: number;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CartItemRequest {
  productId: number;
  qty: number;
}
