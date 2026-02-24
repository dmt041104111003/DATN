export type Category = {
  id: number;
  labelEn: string;
  labelVi: string;
  labelZh: string;
  labelFr: string;
  descriptionEn: string | null;
  descriptionVi: string | null;
  descriptionZh: string | null;
  descriptionFr: string | null;
  imageUrl: string | null;
  icon: string | null;
  sortOrder: number;
};

export type Product = {
  id: number;
  categoryId: number;
  slug: string;
  nameEn: string;
  nameVi: string;
  nameZh: string;
  nameFr: string;
  descriptionEn: string | null;
  descriptionVi: string | null;
  descriptionZh: string | null;
  descriptionFr: string | null;
  imageUrl: string | null;
  youtubeUrl: string | null;
  sortOrder: number;
  category: Category;
};

export type ProductListItem = {
  id: number;
  slug: string;
  nameVi: string;
};
