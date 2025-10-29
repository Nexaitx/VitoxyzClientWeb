export interface SingleProductFormConfig {
  productForm: string;
  label: string;
  imageUrl: string;
  altText?: string;
  cssClass?: string;
  description?: string;
  endpoint?: string;
}

export interface Product {
  id: string | null;
  productId?: string;
  name: string;
  productForm?: string;
  mrp: number;
  imageUrl?: string;
  packaging?: string;
  manufacturers?: string;
  discountPrice?: number;
  originalPrice?: number;
  discountPercentage?: number;
  isAvailable?: boolean;
  type?: string;
  information?: string;
}

export interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    content: Product[];
    page: {
      size: number;
      number: number;
      totalElements: number;
      totalPages: number;
    };
  };
}