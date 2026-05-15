export type ProductType = 'WHEEL' | 'BEARING';

export interface Product {
  id: number;
  name: string;
  price: number;
  stockQty: number;
  imageUrl: string | null;
  type: ProductType;

  // Wheel fields
  maxLoad?: number;
  material?: string;
  size?: string;

  // Bearing fields
  diameter?: string;
  bearingMaterial?: string;
  bearingSize?: string;
}

export interface ProductFilter {
  name?: string;
  type?: ProductType;
  size?: string;
  material?: string;
  maxLoad?: number;
  diameter?: string;
  bearingMaterial?: string;  // UC-5: required filter criterion
}
