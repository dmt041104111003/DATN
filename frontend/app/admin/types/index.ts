export type Product = {
  id: number;
  slug: string;
  nameEn: string;
  descriptionEn: string | null;
  imageUrl: string | null;
};

export type ProductListItem = {
  id: number;
  slug: string;
  nameEn: string;
};
