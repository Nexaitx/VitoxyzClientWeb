export interface CommonFilterConfig {
  endpoint: string;
  productForms: string[];
  title: string;
  image?: string;
  slideCount?: number;
  autoSlide?: boolean;
  slideInterval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
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