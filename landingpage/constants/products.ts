import { Language, ProductItem } from '@/types';

export interface ProductCategoryItem {
  id: string;
  label: Record<Language, string>;
  icon?: string;
}

export const PRODUCT_CATEGORIES: ProductCategoryItem[] = [
  { id: 'gold', label: { en: 'Gold', vi: 'Vàng', zh: '黄金', fr: 'Or' }, icon: 'diamond' },
  { id: 'wood', label: { en: 'Wood', vi: 'Gỗ', zh: '木材', fr: 'Bois' }, icon: 'forest' },
  { id: 'paper', label: { en: 'Paper Production', vi: 'Sản xuất Giấy', zh: '造纸', fr: 'Production de Papier' }, icon: 'description' },
  { id: 'rice', label: { en: 'Rice Business', vi: 'Kinh doanh Gạo', zh: '大米业务', fr: 'Commerce du Riz' }, icon: 'agriculture' },
];

export const ORDERED_CATEGORY_IDS = PRODUCT_CATEGORIES.map((c) => c.id);

export const PRODUCT_TYPE_LABEL: Record<Language, string> = {
  en: 'Product type',
  vi: 'Loại sản phẩm',
  zh: '产品类型',
  fr: 'Type de produit',
};

export const PRODUCT_TYPE_OPTIONS: Record<string, Record<Language, string>> = {
  all: { en: 'All', vi: 'Tất cả', zh: '全部', fr: 'Tous' },
  ...Object.fromEntries(
    PRODUCT_CATEGORIES.map((c) => [c.id, c.label])
  ),
};

export const PRODUCTS: ProductItem[] = [
  {
    id: '1',
    slug: 'vang-mieng-99-99-1oz',
    name: {
      en: 'Gold Bar 99.99 1oz',
      vi: 'Vàng miếng 99.99 1oz',
      zh: '99.99金条 1盎司',
      fr: 'Lingot d\'or 99.99 1oz',
    },
    description: {
      en: 'Investment-grade gold bar with 99.99% purity. Certified by international refiners, suitable for storage and investment. Standard 1 troy ounce (31.1g).',
      vi: 'Vàng miếng đầu tư độ tinh khiết 99.99%. Chứng nhận từ các nhà luyện kim quốc tế, phù hợp tích trữ và đầu tư. Khối lượng chuẩn 1 troy ounce (31.1g).',
      zh: '投资级金条，纯度99.99%。获国际精炼商认证，适合储存与投资。标准1金衡盎司（31.1克）。',
      fr: 'Lingot d\'or d\'investissement pureté 99.99%. Certifié par des affineurs internationaux, adapté au stockage et à l\'investissement. 1 once troy (31.1g).',
    },
    specs: [
      { label: { en: 'Purity', vi: 'Độ tinh khiết', zh: '纯度', fr: 'Pureté' }, value: { en: '99.99%', vi: '99.99%', zh: '99.99%', fr: '99.99%' } },
      { label: { en: 'Weight', vi: 'Khối lượng', zh: '重量', fr: 'Poids' }, value: { en: '1 oz (31.1g)', vi: '1 oz (31.1g)', zh: '1盎司 (31.1克)', fr: '1 oz (31.1g)' } },
      { label: { en: 'Origin', vi: 'Xuất xứ', zh: '产地', fr: 'Origine' }, value: { en: 'Certified refiner', vi: 'Nhà luyện kim chứng nhận', zh: '认证精炼商', fr: 'Affineur certifié' } },
    ],
    image: '/bot.png',
    categoryId: 'gold',
  },
  {
    id: '2',
    slug: 'trang-suc-vang-24k',
    name: {
      en: 'Gold Jewelry 24K',
      vi: 'Trang sức vàng 24K',
      zh: '24K金饰',
      fr: 'Bijoux en or 24K',
    },
    description: {
      en: '24K gold jewelry, 99.9% pure gold. Handcrafted design, ideal for gifts and personal use. Each piece comes with authenticity certificate.',
      vi: 'Trang sức vàng 24K, vàng nguyên chất 99.9%. Thiết kế thủ công, phù hợp làm quà tặng và sử dụng cá nhân. Kèm chứng nhận xuất xứ.',
      zh: '24K金饰，纯度99.9%。手工设计，适合馈赠与自用。每件附真品证书。',
      fr: 'Bijoux en or 24K, or pur 99.9%. Design artisanal, idéal cadeau ou usage personnel. Certificat d\'authenticité inclus.',
    },
    specs: [
      { label: { en: 'Purity', vi: 'Độ tinh khiết', zh: '纯度', fr: 'Pureté' }, value: { en: '24K (99.9%)', vi: '24K (99.9%)', zh: '24K (99.9%)', fr: '24K (99.9%)' } },
      { label: { en: 'Material', vi: 'Chất liệu', zh: '材质', fr: 'Matière' }, value: { en: 'Pure gold', vi: 'Vàng nguyên chất', zh: '纯金', fr: 'Or pur' } },
    ],
    image: '/bot.png',
    categoryId: 'gold',
  },
  {
    id: '3',
    slug: 'van-go-keo',
    name: {
      en: 'Acacia Wood Plank',
      vi: 'Ván gỗ keo',
      zh: '相思木板材',
      fr: 'Planche en bois d\'acacia',
    },
    description: {
      en: 'Premium acacia wood plank, naturally durable and termite-resistant. Sourced from sustainable plantations. Suitable for flooring, furniture and interior decoration.',
      vi: 'Ván gỗ keo cao cấp, bền tự nhiên, chống mối mọt. Nguồn gỗ từ rừng trồng bền vững. Dùng cho sàn, nội thất và trang trí.',
      zh: '优质相思木板材，天然耐用防蛀。来自可持续林地。适用于地板、家具与室内装饰。',
      fr: 'Planche en acacia premium, durable et résistante aux termites. Provenance plantations durables. Idéale parquet, mobilier et décoration.',
    },
    specs: [
      { label: { en: 'Dimensions', vi: 'Kích thước', zh: '尺寸', fr: 'Dimensions' }, value: { en: '2000×120×20 mm', vi: '2000×120×20 mm', zh: '2000×120×20 毫米', fr: '2000×120×20 mm' } },
      { label: { en: 'Material', vi: 'Chất liệu', zh: '材质', fr: 'Matière' }, value: { en: 'Acacia wood', vi: 'Gỗ keo', zh: '相思木', fr: 'Bois d\'acacia' } },
    ],
    image: '/bot.png',
    categoryId: 'wood',
  },
  {
    id: '4',
    slug: 'noi-that-go-soi',
    name: {
      en: 'Teak Wood Furniture',
      vi: 'Nội thất gỗ sồi',
      zh: '柚木家具',
      fr: 'Mobilier en teck',
    },
    description: {
      en: 'Solid teak furniture, classic design. High durability, suitable for indoor and outdoor use. Treated surface, easy to maintain.',
      vi: 'Nội thất gỗ teak nguyên khối, thiết kế cổ điển. Độ bền cao, dùng trong nhà và ngoài trời. Bề mặt xử lý, dễ bảo trì.',
      zh: '实木柚木家具，经典设计。耐用好保养，室内外皆宜。表面处理，易维护。',
      fr: 'Mobilier en teck massif, design classique. Grande durabilité, usage intérieur et extérieur. Surface traitée, entretien facile.',
    },
    specs: [
      { label: { en: 'Material', vi: 'Chất liệu', zh: '材质', fr: 'Matière' }, value: { en: 'Solid teak', vi: 'Gỗ teak nguyên khối', zh: '实木柚木', fr: 'Teck massif' } },
      { label: { en: 'Finish', vi: 'Hoàn thiện', zh: '表面', fr: 'Finition' }, value: { en: 'Natural oil', vi: 'Dầu tự nhiên', zh: '天然油', fr: 'Huile naturelle' } },
    ],
    image: '/bot.png',
    categoryId: 'wood',
  },
  {
    id: '5',
    slug: 'giay-in-a4-500-to',
    name: {
      en: 'Copy Paper A4 500 sheets',
      vi: 'Giấy in A4 500 tờ',
      zh: 'A4复印纸 500张',
      fr: 'Papier copie A4 500 feuilles',
    },
    description: {
      en: 'A4 copy paper 80 g/m², 500 sheets per ream. Bright white, smooth surface, suitable for laser and inkjet printers. Acid-free, long-lasting.',
      vi: 'Giấy in A4 80 g/m², 500 tờ/cuộn. Trắng sáng, bề mặt mịn, dùng cho máy in laser và phun. Không axit, lưu trữ lâu.',
      zh: 'A4复印纸80克/平方米，500张/包。亮白平滑，适用激光与喷墨打印机。无酸耐久。',
      fr: 'Papier copie A4 80 g/m², 500 feuilles/rame. Blanc vif, surface lisse, laser et jet d\'encre. Sans acide, archivage longue durée.',
    },
    specs: [
      { label: { en: 'Size', vi: 'Khổ giấy', zh: '规格', fr: 'Format' }, value: { en: 'A4 (210×297 mm)', vi: 'A4 (210×297 mm)', zh: 'A4 (210×297 mm)', fr: 'A4 (210×297 mm)' } },
      { label: { en: 'Grammage', vi: 'Định lượng', zh: '克重', fr: 'Grammage' }, value: { en: '80 g/m²', vi: '80 g/m²', zh: '80 克/平方米', fr: '80 g/m²' } },
      { label: { en: 'Sheets', vi: 'Số tờ', zh: '张数', fr: 'Feuilles' }, value: { en: '500 sheets', vi: '500 tờ', zh: '500张', fr: '500 feuilles' } },
    ],
    image: '/bot.png',
    categoryId: 'paper',
  },
  {
    id: '6',
    slug: 'thung-carton',
    name: {
      en: 'Cardboard Box Set',
      vi: 'Thùng carton',
      zh: '纸箱套装',
      fr: 'Lot de cartons',
    },
    description: {
      en: 'Recyclable cardboard boxes, 3-layer structure. Strong and lightweight, for packaging and shipping. Multiple sizes in one set.',
      vi: 'Thùng carton tái chế, cấu trúc 3 lớp. Chắc nhẹ, dùng đóng gói và vận chuyển. Nhiều kích thước trong một bộ.',
      zh: '可回收纸箱，三层结构。坚固轻便，用于包装与运输。一套多尺寸。',
      fr: 'Cartons recyclables, structure 3 plis. Résistants et légers, conditionnement et expédition. Plusieurs tailles par lot.',
    },
    specs: [
      { label: { en: 'Material', vi: 'Chất liệu', zh: '材质', fr: 'Matière' }, value: { en: '3-ply cardboard', vi: 'Carton 3 lớp', zh: '三层纸板', fr: 'Carton 3 plis' } },
      { label: { en: 'Set', vi: 'Bộ', zh: '套装', fr: 'Lot' }, value: { en: '5 pieces', vi: '5 chiếc', zh: '5件', fr: '5 pièces' } },
    ],
    image: '/bot.png',
    categoryId: 'paper',
  },
  {
    id: '7',
    slug: 'gao-thom-5kg',
    name: {
      en: 'Jasmine Rice 5kg',
      vi: 'Gạo thơm 5kg',
      zh: '香米 5公斤',
      fr: 'Riz jasmin 5kg',
    },
    description: {
      en: 'Premium jasmine rice, fragrant and soft when cooked. Sourced from quality paddies. Vacuum-packed 5kg bag, store in a cool dry place.',
      vi: 'Gạo thơm cao cấp, cơm dẻo thơm. Nguồn gạo từ vùng trồng chất lượng. Đóng gói hút chân không 5kg, bảo quản nơi khô mát.',
      zh: '优质香米，煮后香软。优质产区直供。真空包装5公斤，阴凉干燥保存。',
      fr: 'Riz jasmin premium, parfumé et moelleux. Provenance rizières de qualité. Sachet 5kg sous vide, conserver au sec.',
    },
    specs: [
      { label: { en: 'Weight', vi: 'Khối lượng', zh: '重量', fr: 'Poids' }, value: { en: '5 kg', vi: '5 kg', zh: '5 公斤', fr: '5 kg' } },
      { label: { en: 'Origin', vi: 'Xuất xứ', zh: '产地', fr: 'Origine' }, value: { en: 'Vietnam', vi: 'Việt Nam', zh: '越南', fr: 'Vietnam' } },
    ],
    image: '/bot.png',
    categoryId: 'rice',
  },
  {
    id: '8',
    slug: 'gao-nep-1kg',
    name: {
      en: 'Sticky Rice 1kg',
      vi: 'Gạo nếp 1kg',
      zh: '糯米 1公斤',
      fr: 'Riz gluant 1kg',
    },
    description: {
      en: 'Glutinous sticky rice, 1kg pack. Ideal for traditional dishes, desserts and brewing. Premium quality, carefully selected.',
      vi: 'Gạo nếp dẻo, gói 1kg. Phù hợp món truyền thống, đồ ngọt và ủ rượu. Chất lượng cao, tuyển chọn kỹ.',
      zh: '糯米，1公斤装。适合传统菜、甜点和酿酒。优质精选。',
      fr: 'Riz gluant, sachet 1kg. Idéal plats traditionnels, desserts et fermentation. Qualité premium, sélection rigoureuse.',
    },
    specs: [
      { label: { en: 'Weight', vi: 'Khối lượng', zh: '重量', fr: 'Poids' }, value: { en: '1 kg', vi: '1 kg', zh: '1 公斤', fr: '1 kg' } },
      { label: { en: 'Origin', vi: 'Xuất xứ', zh: '产地', fr: 'Origine' }, value: { en: 'Vietnam', vi: 'Việt Nam', zh: '越南', fr: 'Vietnam' } },
    ],
    image: '/bot.png',
    categoryId: 'rice',
  },
];

export const PRODUCT_PAGE_TITLE: Record<Language, string> = {
  en: 'Products',
  vi: 'Sản phẩm',
  zh: '产品',
  fr: 'Produits',
};

export const PRODUCT_SEARCH_PLACEHOLDER: Record<Language, string> = {
  en: 'Search products...',
  vi: 'Tìm kiếm sản phẩm...',
  zh: '搜索产品...',
  fr: 'Rechercher des produits...',
};

export const PRODUCT_FILTER_SORT: Record<Language, string> = {
  en: 'Sort by',
  vi: 'Sắp xếp',
  zh: '排序',
  fr: 'Trier par',
};

export const PRODUCT_SORT_OPTIONS: Record<string, Record<Language, string>> = {
  newest: {
    en: 'Newest',
    vi: 'Mới nhất',
    zh: '最新',
    fr: 'Plus récent',
  },
  priceAsc: {
    en: 'Price: Low to High',
    vi: 'Giá: Thấp đến cao',
    zh: '价格：低到高',
    fr: 'Prix : croissant',
  },
  priceDesc: {
    en: 'Price: High to Low',
    vi: 'Giá: Cao đến thấp',
    zh: '价格：高到低',
    fr: 'Prix : décroissant',
  },
};

export const PRODUCT_DETAIL_SKU: Record<Language, string> = {
  en: 'SKU',
  vi: 'Mã SP',
  zh: '货号',
  fr: 'Réf.',
};
export const PRODUCT_DETAIL_BRAND: Record<Language, string> = {
  en: 'Brand',
  vi: 'Thương hiệu',
  zh: '品牌',
  fr: 'Marque',
};
export const PRODUCT_DETAIL_STATUS: Record<Language, string> = {
  en: 'Status',
  vi: 'Tình trạng',
  zh: '状态',
  fr: 'Disponibilité',
};
export const PRODUCT_DETAIL_IN_STOCK: Record<Language, string> = {
  en: 'In stock',
  vi: 'Còn hàng',
  zh: '有货',
  fr: 'En stock',
};
export const PRODUCT_DETAIL_DESCRIPTION: Record<Language, string> = {
  en: 'Description',
  vi: 'Mô tả',
  zh: '描述',
  fr: 'Description',
};
export const PRODUCT_DETAIL_SPECS: Record<Language, string> = {
  en: 'Specifications',
  vi: 'Thông số',
  zh: '规格',
  fr: 'Caractéristiques',
};
