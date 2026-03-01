import { Language, DoanhSoContent } from '@/types';

export const DOANH_SO_UNITS: Record<Language, {
  billionUSD: string;
  million: string;
  thousandTrillion: string;
  plus: string;
}> = {
  en: {
    billionUSD: ' billion USD',
    million: ' million',
    thousandTrillion: ' trillion',
    plus: ' +',
  },
  vi: {
    billionUSD: ' tỷ USD',
    million: ' triệu',
    thousandTrillion: ' nghìn tỷ',
    plus: ' +',
  },
  zh: {
    billionUSD: ' 十亿美元',
    million: ' 百万',
    thousandTrillion: ' 万亿',
    plus: ' +',
  },
  fr: {
    billionUSD: ' milliards USD',
    million: ' millions',
    thousandTrillion: ' milliers de milliards',
    plus: ' +',
  },
};

export const DOANH_SO_CONTENT: Record<Language, DoanhSoContent> = {
  en: {
    title: 'NOTABLE FIGURES',
    brandValue: {
      billionWorth: 'BILLION-WORTH BRAND',
      vietnamMostValuable: 'VIETNAM\'S MOST VALUABLE BRAND',
      southeastAsiaMostValuable: 'MOST VALUABLE TELECOM BRAND IN SOUTHEAST ASIA',
      worldMostValuable: 'MOST VALUABLE BRAND IN THE WORLD',
    },
    markets: {
      title: 'INTERNATIONAL MARKETS',
      description: 'country Asia - America - Africa',
    },
    marketSize: {
      title: 'MARKET SIZE',
      description: 'million citizen',
    },
    scale: {
      title: 'SCALE',
      description: 'employees',
    },
    revenue: {
      title: 'REVENUE',
      description: 'trillion VND (2021)',
    },
    profit: {
      title: 'PROFIT',
      description: 'trillion VND (2021)',
    },
  },
  vi: {
    title: 'CON SỐ NỔI BẬT',
    brandValue: {
      billionWorth: 'THƯƠNG HIỆU TRỊ GIÁ TỶ',
      vietnamMostValuable: 'THƯƠNG HIỆU GIÁ TRỊ NHẤT VIỆT NAM',
      southeastAsiaMostValuable: 'THƯƠNG HIỆU VIỄN THÔNG GIÁ TRỊ NHẤT ĐÔNG NAM Á',
      worldMostValuable: 'THƯƠNG HIỆU GIÁ TRỊ NHẤT THẾ GIỚI',
    },
    markets: {
      title: 'THỊ TRƯỜNG QUỐC TẾ',
      description: 'quốc gia Châu Á - Châu Mỹ - Châu Phi',
    },
    marketSize: {
      title: 'QUY MÔ THỊ TRƯỜNG',
      description: 'triệu công dân',
    },
    scale: {
      title: 'QUY MÔ',
      description: 'nhân viên',
    },
    revenue: {
      title: 'DOANH THU',
      description: 'nghìn tỷ VND (2021)',
    },
    profit: {
      title: 'LỢI NHUẬN',
      description: 'nghìn tỷ VND (2021)',
    },
  },
  zh: {
    title: '显著数字',
    brandValue: {
      billionWorth: '价值数十亿的品牌',
      vietnamMostValuable: '越南最有价值品牌',
      southeastAsiaMostValuable: '东南亚最有价值电信品牌',
      worldMostValuable: '世界最有价值品牌',
    },
    markets: {
      title: '国际市场',
      description: '国家 亚洲 - 美洲 - 非洲',
    },
    marketSize: {
      title: '市场规模',
      description: '百万公民',
    },
    scale: {
      title: '规模',
      description: '员工',
    },
    revenue: {
      title: '收入',
      description: '万亿越南盾 (2021)',
    },
    profit: {
      title: '利润',
      description: '万亿越南盾 (2021)',
    },
  },
  fr: {
    title: 'CHIFFRES REMARQUABLES',
    brandValue: {
      billionWorth: 'MARQUE VALORISÉE EN MILLIARDS',
      vietnamMostValuable: 'MARQUE LA PLUS PRÉCIEUSE DU VIETNAM',
      southeastAsiaMostValuable: 'MARQUE DE TÉLÉCOMMUNICATIONS LA PLUS PRÉCIEUSE D\'ASIE DU SUD-EST',
      worldMostValuable: 'MARQUE LA PLUS PRÉCIEUSE AU MONDE',
    },
    markets: {
      title: 'MARCHÉS INTERNATIONAUX',
      description: 'pays Asie - Amérique - Afrique',
    },
    marketSize: {
      title: 'TAILLE DU MARCHÉ',
      description: 'millions de citoyens',
    },
    scale: {
      title: 'ÉCHELLE',
      description: 'employés',
    },
    revenue: {
      title: 'REVENUS',
      description: 'milliers de milliards VND (2021)',
    },
    profit: {
      title: 'PROFIT',
      description: 'milliers de milliards VND (2021)',
    },
  },
};
