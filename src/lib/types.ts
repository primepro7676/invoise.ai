export interface PackageDTO {
  id: string;
  name: string;
  price: number;
  description: string;
  isCustom: boolean;
  categoryId: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description: string;
  packages: PackageDTO[];
}

export interface CustomerDTO {
  id: string;
  companyName: string;
  contactPerson: string;
  billingAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  email: string;
  gstin: string;
  placeOfSupply: string;
}

export interface BundleItemDTO {
  categoryName: string;
  packageName: string;
  quantity: number;
  rate: number;
  description?: string;
  isCustomPrice?: boolean;
}

export interface PackageBundleDTO {
  id: string;
  name: string;
  subtitle: string;
  tier: string;
  items: BundleItemDTO[];
  totalPrice: number;
  discountPrice: number;
  finalPrice: number;
  platformsIncluded: string;
  deliverables: string;
  paymentTerms: string;
  specialNote: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
