export type OrderState = 'REGISTERED' | 'CONFIRMED' | 'ON_GOING' | 'DELIVERED' | 'CANCELED';

export interface OrderItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  username: string;
  status: OrderState;
  paymentMethod: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export interface OrderConfirmation {
  orderId: number;
  status: OrderState;
  total: number;
}

export interface CheckoutRequest {
  firstName: string;
  lastName: string;
  deliveryAddress: string;
  city: string;
  county: string;
  phone: string;
  paymentMethod: 'CARD' | 'B2B' | 'RAMBURS';
}

export const ORDER_STATE_LABEL: Record<OrderState, string> = {
  REGISTERED: 'Înregistrată',
  CONFIRMED:  'Confirmată',
  ON_GOING:   'În Procesare',
  DELIVERED:  'Livrată',
  CANCELED:   'Anulată',
};
