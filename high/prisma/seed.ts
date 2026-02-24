import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seed...');

  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const catVang = await prisma.category.create({
    data: {
      labelEn: 'Gold',
      labelVi: 'Vàng',
      labelZh: '金',
      labelFr: 'Or',
      descriptionEn: 'Gold and precious metals are a cornerstone of our investment and trading activities. We offer certified gold bars, jewelry-grade gold, and bullion products that meet international standards for purity and traceability. Our gold segment serves both institutional investors and retail customers seeking a reliable store of value and portfolio diversification.',
      descriptionVi: 'Vàng và kim loại quý là một trong những trụ cột hoạt động đầu tư và kinh doanh của chúng tôi. Chúng tôi cung cấp vàng miếng có chứng nhận, vàng trang sức cao cấp và sản phẩm vàng thỏi đáp ứng tiêu chuẩn quốc tế về độ tinh khiết và truy xuất nguồn gốc. Phân khúc vàng phục vụ cả nhà đầu tư tổ chức và khách hàng cá nhân tìm kiếm tài sản tích trữ an toàn và đa dạng hóa danh mục.',
      descriptionZh: '黄金与贵金属是我们投资与贸易业务的核心板块之一。我们提供经认证的金条、珠宝级黄金以及符合国际纯度与溯源标准的金锭产品。黄金业务面向机构投资者与个人客户，满足资产保值和投资组合多元化的需求。',
      descriptionFr: 'L\'or et les métaux précieux sont au cœur de nos activités d\'investissement et de négoce. Nous proposons des lingots certifiés, de l\'or joaillerie et des produits en or répondant aux normes internationales de pureté et de traçabilité. Ce segment s\'adresse aux investisseurs institutionnels comme aux particuliers recherchant une valeur refuge et une diversification de portefeuille.',
      imageUrl: null,
      icon: 'gold',
      sortOrder: 0,
    },
  });

  const catGo = await prisma.category.create({
    data: {
      labelEn: 'Wood',
      labelVi: 'Gỗ',
      labelZh: '木',
      labelFr: 'Bois',
      descriptionEn: 'Our wood and timber division covers sustainable forestry, sawmilling, and value-added wood products. We source premium hardwoods and engineered wood for furniture, construction, and interior design. All materials are selected with attention to durability, aesthetics, and responsible sourcing to support long-lasting applications and environmental stewardship.',
      descriptionVi: 'Lĩnh vực gỗ và gỗ xẻ của chúng tôi bao gồm lâm nghiệp bền vững, xẻ gỗ và sản phẩm gỗ gia tăng. Chúng tôi cung cấp gỗ cứng cao cấp và gỗ công nghiệp cho nội thất, xây dựng và thiết kế nội thất. Mọi nguyên liệu đều được chọn lọc theo tiêu chí bền bỉ, thẩm mỹ và nguồn gốc có trách nhiệm, phục vụ ứng dụng lâu dài và bảo vệ môi trường.',
      descriptionZh: '木材与木制品业务涵盖可持续林业、锯材与高附加值木制品。我们采购优质硬木与工程木，用于家具、建筑与室内设计。选材注重耐久性、美观与负责任采购，以支持长期使用与环境保护。',
      descriptionFr: 'Notre division bois et sciages couvre la sylviculture durable, le sciage et les produits du bois à valeur ajoutée. Nous sourçons des bois durs d\'exception et des bois d’ingénierie pour l’ameublement, la construction et la décoration intérieure. Les matériaux sont choisis pour leur durabilité, leur esthétique et un approvisionnement responsable, au service d’applications durables et du respect de l’environnement.',
      imageUrl: null,
      icon: 'wood',
      sortOrder: 1,
    },
  });

  const catGiay = await prisma.category.create({
    data: {
      labelEn: 'Paper',
      labelVi: 'Giấy',
      labelZh: '纸',
      labelFr: 'Papier',
      descriptionEn: 'The paper segment includes traditional and industrial paper production. We supply specialty papers such as Vietnamese dó paper for art and calligraphy, as well as kraft, packaging, and technical papers for industry. Our products balance cultural heritage with modern manufacturing to meet diverse demands from artisans, publishers, and industrial clients.',
      descriptionVi: 'Phân khúc giấy bao gồm sản xuất giấy truyền thống và công nghiệp. Chúng tôi cung cấp giấy đặc chủng như giấy dó Việt Nam cho nghệ thuật và thư pháp, cùng giấy kraft, giấy đóng gói và giấy kỹ thuật cho công nghiệp. Sản phẩm kết hợp giữa di sản văn hóa và công nghệ hiện đại, đáp ứng nhu cầu đa dạng từ nghệ nhân, nhà xuất bản đến khách hàng công nghiệp.',
      descriptionZh: '纸张业务涵盖传统与工业用纸生产。我们供应特种纸，如越南构树纸用于艺术与书法，以及牛皮纸、包装纸与工业技术用纸。产品兼顾文化传承与现代制造，满足手工艺人、出版业与工业客户的多样化需求。',
      descriptionFr: 'Le segment papier regroupe la production de papiers traditionnels et industriels. Nous fournissons des papiers spéciaux tels que le papier dó vietnamien pour l’art et la calligraphie, ainsi que des papiers kraft, d’emballage et techniques pour l’industrie. Nos produits allient patrimoine culturel et fabrication moderne pour répondre aux besoins des artisans, éditeurs et clients industriels.',
      imageUrl: null,
      icon: 'paper',
      sortOrder: 2,
    },
  });

  const catGao = await prisma.category.create({
    data: {
      labelEn: 'Rice',
      labelVi: 'Gạo',
      labelZh: '米',
      labelFr: 'Riz',
      descriptionEn: 'Rice and grains form an essential part of our agribusiness. We trade and distribute premium rice varieties including award-winning fragrant rice, sticky rice, and specialty grains for domestic and export markets. Quality control, traceability, and sustainable farming practices are central to our rice operations, ensuring safe and reliable supply for consumers and partners.',
      descriptionVi: 'Gạo và ngũ cốc là mảng quan trọng trong hoạt động nông nghiệp của chúng tôi. Chúng tôi kinh doanh và phân phối các giống gạo cao cấp bao gồm gạo thơm đoạt giải, gạo nếp và các loại hạt đặc sản cho thị trường nội địa và xuất khẩu. Kiểm soát chất lượng, truy xuất nguồn gốc và canh tác bền vững là trọng tâm của hoạt động gạo, đảm bảo nguồn cung an toàn và tin cậy cho người tiêu dùng và đối tác.',
      descriptionZh: '大米与谷物是我们农业业务的核心板块。我们贸易与分销高端稻米品种，包括获奖香米、糯米及特色谷物，面向国内与出口市场。质量控制、溯源与可持续种植贯穿大米业务，为消费者与合作伙伴提供安全可靠的供应。',
      descriptionFr: 'Le riz et les céréales sont au cœur de notre activité agroalimentaire. Nous commercialisons et distribuons des variétés de riz premium, dont des riz parfumés primés, du riz gluant et des grains spéciaux pour le marché national et à l’export. Contrôle qualité, traçabilité et pratiques agricoles durables sont au centre de nos opérations riz, pour une offre sûre et fiable aux consommateurs et partenaires.',
      imageUrl: null,
      icon: 'rice',
      sortOrder: 3,
    },
  });

  const pVang1 = await prisma.product.create({
    data: {
      categoryId: catVang.id,
      slug: 'vang-sjc-9999',
      nameEn: 'SJC 9999 Gold Bar',
      nameVi: 'Vàng miếng SJC 9999',
      nameZh: 'SJC 9999 金条',
      nameFr: 'Lingot d\'or SJC 9999',
      descriptionEn: 'The SJC 9999 gold bar is produced to a purity of 99.99% (24K), under the nationally recognized SJC brand. Each bar is stamped with weight, purity, and serial number, and is suitable for investment, reserve, or institutional trading. SJC bars are widely accepted in domestic and regional markets and can be easily verified for authenticity.',
      descriptionVi: 'Vàng miếng SJC 9999 được sản xuất với độ tinh khiết 99,99% (24K), thuộc thương hiệu SJC được công nhận trên toàn quốc. Mỗi miếng đều được đóng dấu trọng lượng, độ tinh khiết và số seri, phù hợp cho đầu tư, dự trữ hoặc giao dịch tổ chức. Vàng miếng SJC được chấp nhận rộng rãi trên thị trường nội địa và khu vực, dễ dàng xác minh nguồn gốc.',
      descriptionZh: 'SJC 9999 金条纯度为 99.99%（24K），由国内认可的 SJC 品牌生产。每根金条均压印重量、纯度与序列号，适用于投资、储备或机构交易。SJC 金条在境内与区域市场接受度高，便于验真。',
      descriptionFr: 'Le lingot SJC 9999 affiche une pureté de 99,99 % (24 carats), sous la marque SJC reconnue nationalement. Chaque lingot est poinçonné avec le poids, la pureté et un numéro de série, et convient à l’investissement, la réserve ou le négoce institutionnel. Les lingots SJC sont largement acceptés sur les marchés nationaux et régionaux et peuvent être facilement vérifiés.',
      imageUrl: null,
      youtubeUrl: null,
      sortOrder: 0,
    },
  });

  const pVang2 = await prisma.product.create({
    data: {
      categoryId: catVang.id,
      slug: 'vang-trang-trang-suc',
      nameEn: 'White Gold Jewelry',
      nameVi: 'Vàng trắng trang sức',
      nameZh: '白金首饰',
      nameFr: 'Bijoux en or blanc',
      descriptionEn: 'White gold jewelry includes rings, necklaces, bracelets, and earrings crafted from high-purity gold alloyed with metals such as palladium or silver to achieve a bright, silvery finish. Our pieces are designed for both everyday wear and special occasions, with attention to durability and contemporary style. Each item can be customised in weight and design to suit the customer.',
      descriptionVi: 'Trang sức vàng trắng gồm nhẫn, dây chuyền, vòng tay và bông tai được chế tác từ vàng cao cấp pha hợp kim với palladium hoặc bạc để có độ sáng bạc. Sản phẩm phù hợp cả cho sử dụng hàng ngày và dịp đặc biệt, chú trọng độ bền và kiểu dáng hiện đại. Mỗi món có thể tùy chỉnh trọng lượng và thiết kế theo yêu cầu khách hàng.',
      descriptionZh: '白金首饰包括戒指、项链、手镯与耳环，由高纯度黄金与钯或银等金属合金制成，呈现明亮银白色。款式兼顾日常佩戴与重要场合，注重耐用性与现代风格。每件均可按重量与款式定制。',
      descriptionFr: 'Les bijoux en or blanc comprennent bagues, colliers, bracelets et boucles d’oreilles en or de haute pureté allié à du palladium ou de l’argent pour un fini argenté lumineux. Nos pièces conviennent au port quotidien comme aux occasions spéciales, avec un souci de durabilité et de style actuel. Chaque article peut être personnalisé en poids et design.',
      imageUrl: null,
      youtubeUrl: null,
      sortOrder: 1,
    },
  });

  const pGo1 = await prisma.product.create({
    data: {
      categoryId: catGo.id,
      slug: 'go-soi-tu-nhien',
      nameEn: 'Natural Oak Wood',
      nameVi: 'Gỗ sồi tự nhiên',
      nameZh: '天然橡木',
      nameFr: 'Bois de chêne naturel',
      descriptionEn: 'Natural oak wood is sourced from sustainably managed forests and supplied in boards, veneers, and custom dimensions for furniture, flooring, and joinery. The grain is consistent and the timber is kiln-dried to minimise movement. Ideal for tables, cabinets, stairs, and interior panelling where a classic, durable finish is required.',
      descriptionVi: 'Gỗ sồi tự nhiên có nguồn gốc từ rừng quản lý bền vững, cung cấp dạng ván, veneer và kích thước theo yêu cầu cho nội thất, sàn và đồ gỗ. Vân gỗ đều, gỗ được sấy kỹ thuật để hạn chế co giãn. Phù hợp làm bàn, tủ, cầu thang và ốp tường nội thất khi cần bề mặt cổ điển, bền đẹp.',
      descriptionZh: '天然橡木来自可持续经营森林，以板材、单板及定制规格供应，用于家具、地板与细木工。纹理均匀，经窑干处理以减少变形。适用于桌、柜、楼梯及室内护墙，追求经典耐用饰面时选用。',
      descriptionFr: 'Le chêne naturel provient de forêts gérées durablement et est livré en planches, placages et dimensions sur mesure pour l’ameublement, le parquet et la menuiserie. Le fil est régulier et le bois est séché en étuve pour limiter les déformations. Idéal pour tables, armoires, escaliers et lambris lorsque l’on recherche une finition classique et durable.',
      imageUrl: null,
      youtubeUrl: null,
      sortOrder: 0,
    },
  });

  const pGo2 = await prisma.product.create({
    data: {
      categoryId: catGo.id,
      slug: 'go-go-nghien-thuat',
      nameEn: 'Artisan Carved Wood',
      nameVi: 'Gỗ điêu khắc nghệ thuật',
      nameZh: '艺术木雕',
      nameFr: 'Bois sculpté artisanal',
      descriptionEn: 'Artisan carved wood includes decorative panels, screens, figurines, and bespoke furniture elements made by skilled craftspeople. Designs draw on traditional and contemporary motifs and can be tailored for homes, hotels, and cultural spaces. The wood is carefully selected for grain and colour to enhance the final piece.',
      descriptionVi: 'Gỗ điêu khắc nghệ thuật gồm tấm trang trí, bình phong, tượng và chi tiết nội thất đặt làm bởi thợ thủ công lành nghề. Thiết kế kết hợp họa tiết truyền thống và hiện đại, có thể tùy chỉnh cho nhà ở, khách sạn và không gian văn hóa. Gỗ được chọn kỹ theo vân và màu để tôn lên tác phẩm hoàn chỉnh.',
      descriptionZh: '艺术木雕包括装饰板、屏风、小像及定制家具构件，由熟练工匠制作。设计融合传统与现代纹样，可针对住宅、酒店与文化空间定制。木材按纹理与色泽精选，以提升成品效果。',
      descriptionFr: 'Le bois sculpté artisanal comprend panneaux décoratifs, paravents, figurines et éléments de mobilier sur mesure réalisés par des artisans qualifiés. Les motifs s’inspirent du traditionnel et du contemporain et peuvent être adaptés aux habitations, hôtels et espaces culturels. Le bois est choisi pour son fil et sa couleur afin de valoriser l’ouvrage final.',
      imageUrl: null,
      youtubeUrl: null,
      sortOrder: 1,
    },
  });

  const pGiay1 = await prisma.product.create({
    data: {
      categoryId: catGiay.id,
      slug: 'giay-dopong-cao-cap',
      nameEn: 'Premium Dó Paper',
      nameVi: 'Giấy dó cao cấp',
      nameZh: '高级构树纸',
      nameFr: 'Papier dó premium',
      descriptionEn: 'Premium dó paper is made from the bark of the dó tree using traditional Vietnamese methods. It is strong, absorbent, and resistant to ageing, making it ideal for calligraphy, painting, and restoration work. Artists and institutions use it for scrolls, prints, and archival documents. We supply various weights and sizes to suit different artistic and conservation needs.',
      descriptionVi: 'Giấy dó cao cấp được làm từ vỏ cây dó theo phương pháp truyền thống Việt Nam. Giấy bền, thấm mực tốt và chống lão hóa, thích hợp cho thư pháp, hội họa và công tác phục chế. Nghệ sĩ và cơ quan văn hóa sử dụng cho tranh cuộn, bản in và tài liệu lưu trữ. Chúng tôi cung cấp nhiều định lượng và khổ giấy phù hợp nhu cầu nghệ thuật và bảo tồn.',
      descriptionZh: '高级构树纸以构树皮经越南传统工艺制成，强韧、吸墨且耐老化，适用于书法、绘画与修复。艺术家与机构用于卷轴、版画与档案文献。我们供应多种克重与规格，满足不同艺术与保护需求。',
      descriptionFr: 'Le papier dó premium est fabriqué à partir de l’écorce du mûrier à papier selon les procédés traditionnels vietnamiens. Résistant, absorbant et peu sensible au vieillissement, il convient à la calligraphie, la peinture et la restauration. Artistes et institutions l’utilisent pour rouleaux, estampes et documents d’archive. Nous proposons plusieurs grammages et formats selon les besoins artistiques et de conservation.',
      imageUrl: null,
      youtubeUrl: null,
      sortOrder: 0,
    },
  });

  const pGiay2 = await prisma.product.create({
    data: {
      categoryId: catGiay.id,
      slug: 'giay-cong-nghiep',
      nameEn: 'Industrial Paper',
      nameVi: 'Giấy công nghiệp',
      nameZh: '工业用纸',
      nameFr: 'Papier industriel',
      descriptionEn: 'Industrial paper covers kraft paper, packaging paper, and specialty grades for manufacturing and logistics. Applications include cartons, bags, wrapping, labels, and technical uses where strength, printability, or barrier properties are required. We supply in reels and sheets with options for custom dimensions and certifications (e.g. FSC, recycled content) to meet client specifications.',
      descriptionVi: 'Giấy công nghiệp bao gồm giấy kraft, giấy đóng gói và các loại đặc chủng cho sản xuất và logistics. Ứng dụng gồm thùng carton, túi, giấy gói, nhãn và dùng kỹ thuật khi cần độ bền, khả năng in ấn hoặc tính năng chắn. Chúng tôi cung cấp dạng cuộn và tờ với tùy chọn kích thước và chứng nhận (FSC, hàm lượng tái chế) theo yêu cầu khách hàng.',
      descriptionZh: '工业用纸涵盖牛皮纸、包装纸及制造与物流用特种纸。用途包括纸箱、纸袋、包装、标签及对强度、印刷性或阻隔性有要求的技术应用。我们以卷筒与平张供货，可定制规格与认证（如 FSC、再生纤维含量）以满足客户要求。',
      descriptionFr: 'Le papier industriel comprend le kraft, les papiers d’emballage et les qualités spéciales pour la production et la logistique. Usages : cartons, sacs, emballage, étiquettes et applications techniques exigeant résistance, imprimabilité ou propriétés barrière. Nous livrons en bobines et en feuilles, avec options de dimensions et certifications (FSC, contenu recyclé) selon les spécifications clients.',
      imageUrl: null,
      youtubeUrl: null,
      sortOrder: 1,
    },
  });

  const pGao1 = await prisma.product.create({
    data: {
      categoryId: catGao.id,
      slug: 'gao-st25-cao-cap',
      nameEn: 'ST25 Premium Rice',
      nameVi: 'Gạo ST25 cao cấp',
      nameZh: 'ST25 高端大米',
      nameFr: 'Riz premium ST25',
      descriptionEn: 'ST25 is a Vietnamese fragrant long-grain rice that won the World\'s Best Rice award in 2019. It has a subtle aroma, soft yet distinct grains, and is well suited to daily meals and premium dining. Sourced from designated growing areas with strict quality control, ST25 is available in consumer and bulk formats for both domestic and export markets.',
      descriptionVi: 'ST25 là giống gạo thơm hạt dài của Việt Nam từng đoạt giải Gạo ngon nhất thế giới năm 2019. Gạo có mùi thơm nhẹ, hạt mềm nhưng tơi rõ, phù hợp bữa ăn hàng ngày và ẩm thực cao cấp. Được thu mua từ vùng trồng chỉ định với kiểm soát chất lượng chặt chẽ, ST25 có bán dạng tiêu dùng và số lượng lớn cho thị trường nội địa và xuất khẩu.',
      descriptionZh: 'ST25 为越南香型长粒米，曾获 2019 年世界最佳大米奖。米粒清香、软而分明，适合日常饮食与高端餐饮。来自指定产区并经过严格质量控制，ST25 以小包装与大宗形式供应国内与出口市场。',
      descriptionFr: 'Le ST25 est un riz vietnamien parfumé à grain long, lauréat du prix du Meilleur riz du monde en 2019. Il offre une légère aromatique, des grains tendres et bien séparés, adaptés au repas quotidien comme à la restauration premium. Sourcé dans des zones de culture dédiées avec un contrôle qualité strict, le ST25 est disponible en conditionnement consommateur et en vrac pour le marché national et à l’export.',
      imageUrl: null,
      youtubeUrl: null,
      sortOrder: 0,
    },
  });

  const pGao2 = await prisma.product.create({
    data: {
      categoryId: catGao.id,
      slug: 'gao-nep-than',
      nameEn: 'Black Sticky Rice',
      nameVi: 'Gạo nếp than',
      nameZh: '黑糯米',
      nameFr: 'Riz gluant noir',
      descriptionEn: 'Black sticky rice (also known as purple glutinous rice) is an organic variety with a deep colour and nutty flavour. It is rich in antioxidants and fibre and is used in desserts, porridges, and health-oriented recipes. We supply it in whole grain form for retail and food service, with traceability from farm to pack to support quality and sustainability claims.',
      descriptionVi: 'Gạo nếp than (còn gọi là nếp cẩm) là giống hữu cơ có màu sẫm và vị bùi. Giàu chất chống oxy hóa và chất xơ, được dùng trong món ngọt, cháo và công thức tốt cho sức khỏe. Chúng tôi cung cấp dạng hạt nguyên cho bán lẻ và dịch vụ ăn uống, có truy xuất nguồn gốc từ đồng ruộng đến đóng gói để đảm bảo chất lượng và bền vững.',
      descriptionZh: '黑糯米（紫糯米）为有机品种，色泽深、带坚果香，富含抗氧化物质与膳食纤维，用于甜点、粥品及健康食谱。我们以整粒形式供应零售与餐饮，提供从田间到包装的溯源，以支持品质与可持续性承诺。',
      descriptionFr: 'Le riz gluant noir (ou riz glutineux violet) est une variété bio à couleur prononcée et saveur noisette. Riche en antioxydants et en fibres, il est utilisé en desserts, porridges et recettes santé. Nous le fournissons en grain entier pour la vente au détail et la restauration, avec une traçabilité de la parcelle au conditionnement pour garantir qualité et durabilité.',
      imageUrl: null,
      youtubeUrl: null,
      sortOrder: 1,
    },
  });

console.log('Seed xong: Vàng, Gỗ, Giấy, Gạo (categories, products).');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
