import { Language, CoreValue } from '@/types';

export const CORE_VALUES: CoreValue[] = [
  {
    id: 'care',
    title: {
      en: 'Care',
      vi: 'QUAN TÂM',
      zh: '关怀',
      fr: 'Attention',
    },
    description: {
      en: 'Carrying a heart that knows how to care, understand, and be compassionate, we honor the identity of each individual, fostering connection between people. This care is expressed through listening to every need, different desires, and encouraging each person to express themselves in their own way.',
      vi: 'Mang trong mình trái tim biết quan tâm, thấu hiểu và lòng trắc ẩn, Viettel tôn vinh bản sắc mỗi cá nhân, thúc đẩy gắn kết giữa người với người. Sự quan tâm ấy thể hiện qua việc lắng nghe từng nhu cầu, mong muốn khác biệt, khích lệ mỗi người thể hiện bản thân theo cách riêng.',
      zh: '怀着懂得关心、理解和同情的心，我们尊重每个人的个性，促进人与人之间的联系。这种关怀通过倾听每一个需求、不同的愿望，并鼓励每个人以自己的方式表达自己来体现。',
      fr: 'Portant un cœur qui sait comment prendre soin, comprendre et être compatissant, nous honorons l\'identité de chaque individu, favorisant la connexion entre les personnes. Ce soin s\'exprime par l\'écoute de chaque besoin, de différents désirs, et en encourageant chaque personne à s\'exprimer à sa manière.',
    },
    icon: '/khatvong.svg',
  },
  {
    id: 'creativity',
    title: {
      en: 'Creativity',
      vi: 'SÁNG TẠO',
      zh: '创造力',
      fr: 'Créativité',
    },
    description: {
      en: 'People are the driving force that helps us constantly move forward to pioneer and anticipate the changes of the times, exploring potential in a new reality. At Viettel, creativity is an endless flow of inspiration for novel ideas and breakthrough thinking, with the ultimate goal of contributing to creating a better life.',
      vi: 'Con người là động lực giúp Viettel luôn dịch chuyển để tiên phong đón đầu những thay đổi của thời cuộc, khai phá tiềm năng trong thực tại mới. Ở Viettel, sáng tạo là dòng chảy cảm hứng bất tận cho những ý tưởng mới lạ và tư duy đột phá với đích đến là con người để góp phần kiến tạo một cuộc sống tốt đẹp hơn.',
      zh: '人是帮助我们不断前进以引领和预见时代变化的驱动力，在新现实中探索潜力。在Viettel，创造力是新颖想法和突破性思维的无限灵感流，最终目标是贡献于创造更美好的生活。',
      fr: 'Les gens sont la force motrice qui nous aide à avancer constamment pour être pionniers et anticiper les changements de l\'époque, explorant le potentiel dans une nouvelle réalité. Chez Viettel, la créativité est un flux infini d\'inspiration pour des idées novatrices et une pensée révolutionnaire, avec pour objectif ultime de contribuer à créer une vie meilleure.',
    },
    icon: '/sangtao.svg',
  },
  {
    id: 'aspiration',
    title: {
      en: 'Aspiration',
      vi: 'KHÁT KHAO',
      zh: '渴望',
      fr: 'Aspiration',
    },
    description: {
      en: 'The aspiration to dedicate is always an abundant source of energy that helps us break through limits, overcome challenges, and conquer peaks. For every Viettel person, aspiration is also the motivation to think big, the goal to reach far, helping to fulfill national responsibilities and innovate according to global thinking.',
      vi: 'Khát khao cống hiến luôn là nguồn năng lượng dồi dào đưa Viettel bứt phá giới hạn, vượt qua thách thức và chinh phục đỉnh cao. Khát khao đối với mỗi người Viettel còn là động lực để nghĩ lớn, là mục tiêu để vươn xa, giúp thực hiện trọng trách quốc gia và đổi mới theo tư duy toàn cầu.',
      zh: '奉献的渴望始终是帮助我们突破极限、克服挑战、征服高峰的丰富能量源泉。对于每个Viettel人来说，渴望也是思考大问题的动力，是远达的目标，有助于履行国家责任并按照全球思维进行创新。',
      fr: 'L\'aspiration à se dédier est toujours une source abondante d\'énergie qui nous aide à franchir les limites, surmonter les défis et conquérir les sommets. Pour chaque personne Viettel, l\'aspiration est aussi la motivation à penser grand, l\'objectif à atteindre loin, aidant à remplir les responsabilités nationales et à innover selon la pensée mondiale.',
    },
    icon: '/khatvong.svg',
  },
  {
    id: 'integrity',
    title: {
      en: 'Integrity',
      vi: 'CHÍNH TRỰC',
      zh: '正直',
      fr: 'Intégrité',
    },
    description: {
      en: 'A combination of ethics, consistency, and courage: We uphold the value of integrity in all activities and prioritize "what is right" over "who is right."',
      vi: 'Sự kết hợp giữa đạo đức, sự nhất quán và lòng can đảm: Chúng tôi đề cao giá trị chính trực trong mọi hoạt động và xem "cái đúng" quan trọng hơn là "ai đúng".',
      zh: '道德、一致性和勇气的结合：我们在所有活动中坚持正直的价值观，优先考虑"什么是对的"而不是"谁是对的"。',
      fr: 'Une combinaison d\'éthique, de cohérence et de courage : Nous défendons la valeur de l\'intégrité dans toutes les activités et privilégions "ce qui est juste" plutôt que "qui a raison".',
    },
    icon: '/chinhtruc.svg',
  },
  {
    id: 'efficiency',
    title: {
      en: 'Efficiency',
      vi: 'HIỆU QUẢ',
      zh: '效率',
      fr: 'Efficacité',
    },
    description: {
      en: 'Achieving set goals in the best way with optimal resources: We emphasize strengthening synergy and mutual support, as well as contributions from each individual\'s efficiency.',
      vi: 'Đạt mục tiêu đề ra theo cách tốt nhất với nguồn lực tối ưu: Chúng tôi đề cao việc tăng cường sự hiệp lực và tương hỗ, cũng như các đóng góp từ hiệu quả của mỗi cá nhân.',
      zh: '以最佳方式和最优资源实现既定目标：我们强调加强协同和相互支持，以及每个人效率的贡献。',
      fr: 'Atteindre les objectifs fixés de la meilleure façon avec des ressources optimales : Nous mettons l\'accent sur le renforcement de la synergie et du soutien mutuel, ainsi que sur les contributions de l\'efficacité de chaque individu.',
    },
    icon: '/hieuqua.svg',
  },
];

export const CORE_VALUES_TITLE: Record<Language, string> = {
  en: 'Core Values',
  vi: 'Giá trị cốt lõi',
  zh: '核心价值观',
  fr: 'Valeurs fondamentales',
};
