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
