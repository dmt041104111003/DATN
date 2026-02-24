import { Language, TeamMember } from '@/types';

export const TEAM_TITLE: Record<Language, string> = {
  en: 'Leadership Team',
  vi: 'Ban lãnh đạo',
  zh: '领导团队',
  fr: 'Équipe de direction',
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: {
      en: 'Mr. Tao Duc Thang',
      vi: 'Ông Tào Đức Thắng',
      zh: '陶德胜先生',
      fr: 'M. Tao Duc Thang',
    },
    position: {
      en: 'Chairman and General Director',
      vi: 'Chủ tịch và Tổng giám đốc',
      zh: '董事长兼总经理',
      fr: 'Président et Directeur Général',
    },
    image: '/user.png',
    bio: {
      en: 'With over 20 years of experience in the financial sector, Mr. Tao Duc Thang has been instrumental in leading the company\'s strategic growth and digital transformation initiatives.',
      vi: 'Với hơn 20 năm kinh nghiệm trong lĩnh vực tài chính, Ông Tào Đức Thắng đã đóng vai trò quan trọng trong việc dẫn dắt tăng trưởng chiến lược và các sáng kiến chuyển đổi số của công ty.',
      zh: '拥有超过20年的金融行业经验，陶德胜先生在领导公司战略增长和数字化转型计划方面发挥了重要作用。',
      fr: 'Avec plus de 20 ans d\'expérience dans le secteur financier, M. Tao Duc Thang a joué un rôle déterminant dans la conduite de la croissance stratégique de l\'entreprise et des initiatives de transformation numérique.',
    },
    experience: {
      en: [
        'Led digital banking transformation initiatives',
        'Established strategic partnerships with international financial institutions',
        'Oversaw expansion into new markets across Southeast Asia',
      ],
      vi: [
        'Dẫn dắt các sáng kiến chuyển đổi ngân hàng số',
        'Thiết lập quan hệ đối tác chiến lược với các tổ chức tài chính quốc tế',
        'Giám sát việc mở rộng sang các thị trường mới trên khắp Đông Nam Á',
      ],
      zh: [
        '领导数字银行转型计划',
        '与国际金融机构建立战略合作伙伴关系',
        '监督扩展到东南亚新市场',
      ],
      fr: [
        'Dirigé les initiatives de transformation bancaire numérique',
        'Établi des partenariats stratégiques avec des institutions financières internationales',
        'Supervisé l\'expansion vers de nouveaux marchés en Asie du Sud-Est',
      ],
    },
    education: {
      en: 'Master of Business Administration, Harvard Business School',
      vi: 'Thạc sĩ Quản trị Kinh doanh, Trường Kinh doanh Harvard',
      zh: '工商管理硕士，哈佛商学院',
      fr: 'Master en Administration des Affaires, Harvard Business School',
    },
  },
  {
    id: '2',
    name: {
      en: 'Mr. Nguyen Dinh Chien',
      vi: 'Ông Nguyễn Đình Chiến',
      zh: '阮定战先生',
      fr: 'M. Nguyen Dinh Chien',
    },
    position: {
      en: 'Deputy General Director',
      vi: 'Phó Tổng giám đốc',
      zh: '副总经理',
      fr: 'Directeur Général Adjoint',
    },
    image: '/user.png',
  },
  {
    id: '3',
    name: {
      en: 'Mr. Do Minh Phuong',
      vi: 'Ông Đỗ Minh Phương',
      zh: '杜明方先生',
      fr: 'M. Do Minh Phuong',
    },
    position: {
      en: 'Deputy General Director',
      vi: 'Phó Tổng giám đốc',
      zh: '副总经理',
      fr: 'Directeur Général Adjoint',
    },
    image: '/user.png',
  },
  {
    id: '4',
    name: {
      en: 'Mr. Le Van Nam',
      vi: 'Ông Lê Văn Nam',
      zh: '黎文南先生',
      fr: 'M. Le Van Nam',
    },
    position: {
      en: 'Deputy General Director',
      vi: 'Phó Tổng giám đốc',
      zh: '副总经理',
      fr: 'Directeur Général Adjoint',
    },
    image: '/user.png',
  },
  {
    id: '5',
    name: {
      en: 'Mr. Tran Van Long',
      vi: 'Ông Trần Văn Long',
      zh: '陈文龙先生',
      fr: 'M. Tran Van Long',
    },
    position: {
      en: 'Deputy General Director',
      vi: 'Phó Tổng giám đốc',
      zh: '副总经理',
      fr: 'Directeur Général Adjoint',
    },
    image: '/user.png',
  },
  {
    id: '6',
    name: {
      en: 'Mr. Pham Van Hieu',
      vi: 'Ông Phạm Văn Hiếu',
      zh: '范文孝先生',
      fr: 'M. Pham Van Hieu',
    },
    position: {
      en: 'Deputy General Director',
      vi: 'Phó Tổng giám đốc',
      zh: '副总经理',
      fr: 'Directeur Général Adjoint',
    },
    image: '/user.png',
  },
];
