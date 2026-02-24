import { Language, ContactContent, FAQContent, SupportContent } from '@/types';

export const CONTACT_CONTENT: Record<Language, ContactContent> = {
  en: {
    title: {
      en: 'Contact Us',
      vi: 'Liên Hệ',
      zh: '联系我们',
      fr: 'Contactez-nous',
    },
    subtitle: {
      en: 'INDUSTRIAL CORPORATION - MILITARY TELECOMMUNICATIONS',
      vi: 'TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI',
      zh: '工业集团 - 军事电信',
      fr: 'CORPORATION INDUSTRIELLE - TÉLÉCOMMUNICATIONS MILITAIRES',
    },
    form: {
      topic: {
        en: 'Topic',
        vi: 'Chủ đề',
        zh: '主题',
        fr: 'Sujet',
      },
      topicPlaceholder: {
        en: 'Please select the topic you want to respond to',
        vi: 'Vui lòng chọn chủ đề bạn muốn phản hồi',
        zh: '请选择您要回复的主题',
        fr: 'Veuillez sélectionner le sujet auquel vous souhaitez répondre',
      },
      topics: {
        general: {
          en: 'General Inquiry',
          vi: 'Câu hỏi chung',
          zh: '一般咨询',
          fr: 'Demande générale',
        },
        support: {
          en: 'Support',
          vi: 'Hỗ trợ',
          zh: '支持',
          fr: 'Support',
        },
        feedback: {
          en: 'Feedback',
          vi: 'Phản hồi',
          zh: '反馈',
          fr: 'Commentaires',
        },
      },
      messageLabel: {
        en: 'Question/Your feedback',
        vi: 'Câu hỏi/Phản hồi của bạn',
        zh: '问题/您的反馈',
        fr: 'Question/Vos commentaires',
      },
      name: {
        en: 'Full Name',
        vi: 'Họ và Tên',
        zh: '全名',
        fr: 'Nom Complet',
      },
      namePlaceholder: {
        en: 'Enter your full name',
        vi: 'Nhập họ và tên của bạn',
        zh: '请输入您的全名',
        fr: 'Entrez votre nom complet',
      },
      email: {
        en: 'Email Address',
        vi: 'Địa chỉ Email',
        zh: '电子邮件地址',
        fr: 'Adresse Email',
      },
      emailPlaceholder: {
        en: 'Enter your email address',
        vi: 'Nhập địa chỉ email của bạn',
        zh: '请输入您的电子邮件地址',
        fr: 'Entrez votre adresse email',
      },
      phone: {
        en: 'Phone Number',
        vi: 'Số Điện Thoại',
        zh: '电话号码',
        fr: 'Numéro de Téléphone',
      },
      phonePlaceholder: {
        en: 'Enter your phone number',
        vi: 'Nhập số điện thoại của bạn',
        zh: '请输入您的电话号码',
        fr: 'Entrez votre numéro de téléphone',
      },
      subject: {
        en: 'Subject',
        vi: 'Chủ Đề',
        zh: '主题',
        fr: 'Sujet',
      },
      subjectPlaceholder: {
        en: 'Enter subject',
        vi: 'Nhập chủ đề',
        zh: '请输入主题',
        fr: 'Entrez le sujet',
      },
      message: {
        en: 'Message',
        vi: 'Tin Nhắn',
        zh: '消息',
        fr: 'Message',
      },
      messagePlaceholder: {
        en: 'Enter your message here...',
        vi: 'Nhập tin nhắn của bạn tại đây...',
        zh: '请在此输入您的消息...',
        fr: 'Entrez votre message ici...',
      },
      submit: {
        en: 'SEND',
        vi: 'GỬI',
        zh: '发送',
        fr: 'ENVOYER',
      },
    },
    info: {
      description: {
        en: 'We always value and appreciate customer feedback, which helps our products and services improve day by day. Our customer care system operates 24/7 to receive your input and continuously enhance our service quality.',
        vi: 'Chúng tôi luôn trân trọng và đánh giá cao phản hồi của khách hàng, điều này giúp sản phẩm và dịch vụ của chúng tôi ngày càng được cải thiện. Hệ thống chăm sóc khách hàng của chúng tôi hoạt động 24/7 để tiếp nhận ý kiến của bạn và không ngừng nâng cao chất lượng dịch vụ.',
        zh: '我们始终重视并感谢客户的反馈，这有助于我们的产品和服务日复一日地改进。我们的客户服务系统全天候运行，以接收您的意见并不断提高我们的服务质量。',
        fr: 'Nous apprécions toujours les commentaires de nos clients, ce qui aide nos produits et services à s\'améliorer jour après jour. Notre système de service client fonctionne 24h/24 et 7j/7 pour recevoir vos commentaires et améliorer continuellement la qualité de notre service.',
      },
      address: {
        en: 'Lot D26, Cau Giay New Urban Area, Cau Giay Ward, Hanoi City.',
        vi: 'Lô D26, Khu đô thị mới Cầu Giấy, Phường Cầu Giấy, Thành phố Hà Nội.',
        zh: '河内市纸桥区纸桥新城区D26地块。',
        fr: 'Lot D26, Nouvelle Zone Urbaine de Cau Giay, Quartier de Cau Giay, Ville de Hanoi.',
      },
      phone: {
        en: '18008098',
        vi: '18008098',
        zh: '18008098',
        fr: '18008098',
      },
      fax: {
        en: '024 6255 6789',
        vi: '024 6255 6789',
        zh: '024 6255 6789',
        fr: '024 6255 6789',
      },
      hotline: {
        en: '18008098',
        vi: '18008098',
        zh: '18008098',
        fr: '18008098',
      },
    },
  },
  vi: {
    title: {
      en: 'Contact Us',
      vi: 'Liên Hệ',
      zh: '联系我们',
      fr: 'Contactez-nous',
    },
    subtitle: {
      en: 'Get in touch with us. We are here to help you.',
      vi: 'Hãy liên hệ với chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ bạn.',
      zh: '与我们联系。我们随时为您提供帮助。',
      fr: 'Contactez-nous. Nous sommes là pour vous aider.',
    },
    form: {
      name: {
        en: 'Full Name',
        vi: 'Họ và Tên',
        zh: '全名',
        fr: 'Nom Complet',
      },
      namePlaceholder: {
        en: 'Enter your full name',
        vi: 'Nhập họ và tên của bạn',
        zh: '请输入您的全名',
        fr: 'Entrez votre nom complet',
      },
      email: {
        en: 'Email Address',
        vi: 'Địa chỉ Email',
        zh: '电子邮件地址',
        fr: 'Adresse Email',
      },
      emailPlaceholder: {
        en: 'Enter your email address',
        vi: 'Nhập địa chỉ email của bạn',
        zh: '请输入您的电子邮件地址',
        fr: 'Entrez votre adresse email',
      },
      phone: {
        en: 'Phone Number',
        vi: 'Số Điện Thoại',
        zh: '电话号码',
        fr: 'Numéro de Téléphone',
      },
      phonePlaceholder: {
        en: 'Enter your phone number',
        vi: 'Nhập số điện thoại của bạn',
        zh: '请输入您的电话号码',
        fr: 'Entrez votre numéro de téléphone',
      },
      subject: {
        en: 'Subject',
        vi: 'Chủ Đề',
        zh: '主题',
        fr: 'Sujet',
      },
      subjectPlaceholder: {
        en: 'Enter subject',
        vi: 'Nhập chủ đề',
        zh: '请输入主题',
        fr: 'Entrez le sujet',
      },
      message: {
        en: 'Message',
        vi: 'Tin Nhắn',
        zh: '消息',
        fr: 'Message',
      },
      messagePlaceholder: {
        en: 'Enter your message here...',
        vi: 'Nhập tin nhắn của bạn tại đây...',
        zh: '请在此输入您的消息...',
        fr: 'Entrez votre message ici...',
      },
      submit: {
        en: 'Send Message',
        vi: 'Gửi Tin Nhắn',
        zh: '发送消息',
        fr: 'Envoyer le Message',
      },
    },
    info: {
      description: {
        en: 'We always value and appreciate customer feedback, which helps our products and services improve day by day. Our customer care system operates 24/7 to receive your input and continuously enhance our service quality.',
        vi: 'Chúng tôi luôn trân trọng và đánh giá cao phản hồi của khách hàng, điều này giúp sản phẩm và dịch vụ của chúng tôi ngày càng được cải thiện. Hệ thống chăm sóc khách hàng của chúng tôi hoạt động 24/7 để tiếp nhận ý kiến của bạn và không ngừng nâng cao chất lượng dịch vụ.',
        zh: '我们始终重视并感谢客户的反馈，这有助于我们的产品和服务日复一日地改进。我们的客户服务系统全天候运行，以接收您的意见并不断提高我们的服务质量。',
        fr: 'Nous apprécions toujours les commentaires de nos clients, ce qui aide nos produits et services à s\'améliorer jour après jour. Notre système de service client fonctionne 24h/24 et 7j/7 pour recevoir vos commentaires et améliorer continuellement la qualité de notre service.',
      },
      title: {
        en: 'Contact Information',
        vi: 'Thông Tin Liên Hệ',
        zh: '联系信息',
        fr: 'Informations de Contact',
      },
      address: {
        en: '123 Business Street, District 1, Ho Chi Minh City, Vietnam',
        vi: '123 Đường Kinh Doanh, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
        zh: '越南胡志明市第一区商业街123号',
        fr: '123 Rue des Affaires, District 1, Ho Chi Minh-Ville, Vietnam',
      },
      phone: {
        en: '+84 123 456 789',
        vi: '+84 123 456 789',
        zh: '+84 123 456 789',
        fr: '+84 123 456 789',
      },
      email: {
        en: 'contact@dicksoninvestment.com',
        vi: 'contact@dicksoninvestment.com',
        zh: 'contact@dicksoninvestment.com',
        fr: 'contact@dicksoninvestment.com',
      },
      workingHours: {
        en: 'Monday - Friday: 8:00 AM - 5:00 PM',
        vi: 'Thứ Hai - Thứ Sáu: 8:00 - 17:00',
        zh: '周一至周五：上午8:00 - 下午5:00',
        fr: 'Lundi - Vendredi: 8h00 - 17h00',
      },
    },
  },
  zh: {
    title: {
      en: 'Contact Us',
      vi: 'Liên Hệ',
      zh: '联系我们',
      fr: 'Contactez-nous',
    },
    subtitle: {
      en: 'Get in touch with us. We are here to help you.',
      vi: 'Hãy liên hệ với chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ bạn.',
      zh: '与我们联系。我们随时为您提供帮助。',
      fr: 'Contactez-nous. Nous sommes là pour vous aider.',
    },
    form: {
      name: {
        en: 'Full Name',
        vi: 'Họ và Tên',
        zh: '全名',
        fr: 'Nom Complet',
      },
      namePlaceholder: {
        en: 'Enter your full name',
        vi: 'Nhập họ và tên của bạn',
        zh: '请输入您的全名',
        fr: 'Entrez votre nom complet',
      },
      email: {
        en: 'Email Address',
        vi: 'Địa chỉ Email',
        zh: '电子邮件地址',
        fr: 'Adresse Email',
      },
      emailPlaceholder: {
        en: 'Enter your email address',
        vi: 'Nhập địa chỉ email của bạn',
        zh: '请输入您的电子邮件地址',
        fr: 'Entrez votre adresse email',
      },
      phone: {
        en: 'Phone Number',
        vi: 'Số Điện Thoại',
        zh: '电话号码',
        fr: 'Numéro de Téléphone',
      },
      phonePlaceholder: {
        en: 'Enter your phone number',
        vi: 'Nhập số điện thoại của bạn',
        zh: '请输入您的电话号码',
        fr: 'Entrez votre numéro de téléphone',
      },
      subject: {
        en: 'Subject',
        vi: 'Chủ Đề',
        zh: '主题',
        fr: 'Sujet',
      },
      subjectPlaceholder: {
        en: 'Enter subject',
        vi: 'Nhập chủ đề',
        zh: '请输入主题',
        fr: 'Entrez le sujet',
      },
      message: {
        en: 'Message',
        vi: 'Tin Nhắn',
        zh: '消息',
        fr: 'Message',
      },
      messagePlaceholder: {
        en: 'Enter your message here...',
        vi: 'Nhập tin nhắn của bạn tại đây...',
        zh: '请在此输入您的消息...',
        fr: 'Entrez votre message ici...',
      },
      submit: {
        en: 'Send Message',
        vi: 'Gửi Tin Nhắn',
        zh: '发送消息',
        fr: 'Envoyer le Message',
      },
    },
    info: {
      description: {
        en: 'We always value and appreciate customer feedback, which helps our products and services improve day by day. Our customer care system operates 24/7 to receive your input and continuously enhance our service quality.',
        vi: 'Chúng tôi luôn trân trọng và đánh giá cao phản hồi của khách hàng, điều này giúp sản phẩm và dịch vụ của chúng tôi ngày càng được cải thiện. Hệ thống chăm sóc khách hàng của chúng tôi hoạt động 24/7 để tiếp nhận ý kiến của bạn và không ngừng nâng cao chất lượng dịch vụ.',
        zh: '我们始终重视并感谢客户的反馈，这有助于我们的产品和服务日复一日地改进。我们的客户服务系统全天候运行，以接收您的意见并不断提高我们的服务质量。',
        fr: 'Nous apprécions toujours les commentaires de nos clients, ce qui aide nos produits et services à s\'améliorer jour après jour. Notre système de service client fonctionne 24h/24 et 7j/7 pour recevoir vos commentaires et améliorer continuellement la qualité de notre service.',
      },
      title: {
        en: 'Contact Information',
        vi: 'Thông Tin Liên Hệ',
        zh: '联系信息',
        fr: 'Informations de Contact',
      },
      address: {
        en: '123 Business Street, District 1, Ho Chi Minh City, Vietnam',
        vi: '123 Đường Kinh Doanh, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
        zh: '越南胡志明市第一区商业街123号',
        fr: '123 Rue des Affaires, District 1, Ho Chi Minh-Ville, Vietnam',
      },
      phone: {
        en: '+84 123 456 789',
        vi: '+84 123 456 789',
        zh: '+84 123 456 789',
        fr: '+84 123 456 789',
      },
      email: {
        en: 'contact@dicksoninvestment.com',
        vi: 'contact@dicksoninvestment.com',
        zh: 'contact@dicksoninvestment.com',
        fr: 'contact@dicksoninvestment.com',
      },
      workingHours: {
        en: 'Monday - Friday: 8:00 AM - 5:00 PM',
        vi: 'Thứ Hai - Thứ Sáu: 8:00 - 17:00',
        zh: '周一至周五：上午8:00 - 下午5:00',
        fr: 'Lundi - Vendredi: 8h00 - 17h00',
      },
    },
  },
  fr: {
    title: {
      en: 'Contact Us',
      vi: 'Liên Hệ',
      zh: '联系我们',
      fr: 'Contactez-nous',
    },
    subtitle: {
      en: 'Get in touch with us. We are here to help you.',
      vi: 'Hãy liên hệ với chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ bạn.',
      zh: '与我们联系。我们随时为您提供帮助。',
      fr: 'Contactez-nous. Nous sommes là pour vous aider.',
    },
    form: {
      name: {
        en: 'Full Name',
        vi: 'Họ và Tên',
        zh: '全名',
        fr: 'Nom Complet',
      },
      namePlaceholder: {
        en: 'Enter your full name',
        vi: 'Nhập họ và tên của bạn',
        zh: '请输入您的全名',
        fr: 'Entrez votre nom complet',
      },
      email: {
        en: 'Email Address',
        vi: 'Địa chỉ Email',
        zh: '电子邮件地址',
        fr: 'Adresse Email',
      },
      emailPlaceholder: {
        en: 'Enter your email address',
        vi: 'Nhập địa chỉ email của bạn',
        zh: '请输入您的电子邮件地址',
        fr: 'Entrez votre adresse email',
      },
      phone: {
        en: 'Phone Number',
        vi: 'Số Điện Thoại',
        zh: '电话号码',
        fr: 'Numéro de Téléphone',
      },
      phonePlaceholder: {
        en: 'Enter your phone number',
        vi: 'Nhập số điện thoại của bạn',
        zh: '请输入您的电话号码',
        fr: 'Entrez votre numéro de téléphone',
      },
      subject: {
        en: 'Subject',
        vi: 'Chủ Đề',
        zh: '主题',
        fr: 'Sujet',
      },
      subjectPlaceholder: {
        en: 'Enter subject',
        vi: 'Nhập chủ đề',
        zh: '请输入主题',
        fr: 'Entrez le sujet',
      },
      message: {
        en: 'Message',
        vi: 'Tin Nhắn',
        zh: '消息',
        fr: 'Message',
      },
      messagePlaceholder: {
        en: 'Enter your message here...',
        vi: 'Nhập tin nhắn của bạn tại đây...',
        zh: '请在此输入您的消息...',
        fr: 'Entrez votre message ici...',
      },
      submit: {
        en: 'Send Message',
        vi: 'Gửi Tin Nhắn',
        zh: '发送消息',
        fr: 'Envoyer le Message',
      },
    },
    info: {
      description: {
        en: 'We always value and appreciate customer feedback, which helps our products and services improve day by day. Our customer care system operates 24/7 to receive your input and continuously enhance our service quality.',
        vi: 'Chúng tôi luôn trân trọng và đánh giá cao phản hồi của khách hàng, điều này giúp sản phẩm và dịch vụ của chúng tôi ngày càng được cải thiện. Hệ thống chăm sóc khách hàng của chúng tôi hoạt động 24/7 để tiếp nhận ý kiến của bạn và không ngừng nâng cao chất lượng dịch vụ.',
        zh: '我们始终重视并感谢客户的反馈，这有助于我们的产品和服务日复一日地改进。我们的客户服务系统全天候运行，以接收您的意见并不断提高我们的服务质量。',
        fr: 'Nous apprécions toujours les commentaires de nos clients, ce qui aide nos produits et services à s\'améliorer jour après jour. Notre système de service client fonctionne 24h/24 et 7j/7 pour recevoir vos commentaires et améliorer continuellement la qualité de notre service.',
      },
      title: {
        en: 'Contact Information',
        vi: 'Thông Tin Liên Hệ',
        zh: '联系信息',
        fr: 'Informations de Contact',
      },
      address: {
        en: '123 Business Street, District 1, Ho Chi Minh City, Vietnam',
        vi: '123 Đường Kinh Doanh, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
        zh: '越南胡志明市第一区商业街123号',
        fr: '123 Rue des Affaires, District 1, Ho Chi Minh-Ville, Vietnam',
      },
      phone: {
        en: '+84 123 456 789',
        vi: '+84 123 456 789',
        zh: '+84 123 456 789',
        fr: '+84 123 456 789',
      },
      email: {
        en: 'contact@dicksoninvestment.com',
        vi: 'contact@dicksoninvestment.com',
        zh: 'contact@dicksoninvestment.com',
        fr: 'contact@dicksoninvestment.com',
      },
      workingHours: {
        en: 'Monday - Friday: 8:00 AM - 5:00 PM',
        vi: 'Thứ Hai - Thứ Sáu: 8:00 - 17:00',
        zh: '周一至周五：上午8:00 - 下午5:00',
        fr: 'Lundi - Vendredi: 8h00 - 17h00',
      },
    },
  },
};

export const FAQ_CONTENT: Record<Language, FAQContent> = {
  en: {
    title: {
      en: 'Frequently Asked Questions',
      vi: 'Câu Hỏi Thường Gặp',
      zh: '常见问题',
      fr: 'Questions Fréquemment Posées',
    },
    subtitle: {
      en: 'Find answers to common questions about our services and products.',
      vi: 'Tìm câu trả lời cho các câu hỏi phổ biến về dịch vụ và sản phẩm của chúng tôi.',
      zh: '查找有关我们服务和产品的常见问题的答案。',
      fr: 'Trouvez des réponses aux questions courantes sur nos services et produits.',
    },
    items: [
      {
        id: '1',
        question: {
          en: 'What services does Dickson Investment Group offer?',
          vi: 'Dickson Investment Group cung cấp những dịch vụ gì?',
          zh: 'Dickson Investment Group 提供哪些服务？',
          fr: 'Quels services Dickson Investment Group propose-t-il?',
        },
        answer: {
          en: 'We offer a wide range of investment services including gold trading, wood products, paper production, and rice business. Our services are designed to meet diverse investment needs.',
          vi: 'Chúng tôi cung cấp nhiều loại dịch vụ đầu tư bao gồm giao dịch vàng, sản phẩm gỗ, sản xuất giấy và kinh doanh gạo. Các dịch vụ của chúng tôi được thiết kế để đáp ứng nhu cầu đầu tư đa dạng.',
          zh: '我们提供广泛的投资服务，包括黄金交易、木制品、造纸和大米业务。我们的服务旨在满足多样化的投资需求。',
          fr: 'Nous proposons une large gamme de services d\'investissement, notamment le trading d\'or, les produits en bois, la production de papier et le commerce du riz. Nos services sont conçus pour répondre à des besoins d\'investissement diversifiés.',
        },
      },
      {
        id: '2',
        question: {
          en: 'How can I contact customer support?',
          vi: 'Làm thế nào để tôi có thể liên hệ với bộ phận hỗ trợ khách hàng?',
          zh: '如何联系客户支持？',
          fr: 'Comment puis-je contacter le service client?',
        },
        answer: {
          en: 'You can contact us through our contact form on this page, call our hotline at +84 123 456 789, or email us at contact@dicksoninvestment.com. Our support team is available Monday to Friday, 8 AM to 5 PM.',
          vi: 'Bạn có thể liên hệ với chúng tôi qua biểu mẫu liên hệ trên trang này, gọi hotline +84 123 456 789, hoặc gửi email đến contact@dicksoninvestment.com. Đội ngũ hỗ trợ của chúng tôi có mặt từ Thứ Hai đến Thứ Sáu, 8 giờ sáng đến 5 giờ chiều.',
          zh: '您可以通过本页的联系表联系我们，拨打热线 +84 123 456 789，或发送电子邮件至 contact@dicksoninvestment.com。我们的支持团队周一至周五上午8点至下午5点提供服务。',
          fr: 'Vous pouvez nous contacter via notre formulaire de contact sur cette page, appeler notre hotline au +84 123 456 789, ou nous envoyer un email à contact@dicksoninvestment.com. Notre équipe de support est disponible du lundi au vendredi, de 8h à 17h.',
        },
      },
      {
        id: '3',
        question: {
          en: 'What are your business hours?',
          vi: 'Giờ làm việc của bạn là gì?',
          zh: '您的营业时间是什么？',
          fr: 'Quels sont vos horaires d\'ouverture?',
        },
        answer: {
          en: 'Our business hours are Monday through Friday, from 8:00 AM to 5:00 PM (Vietnam time). We are closed on weekends and public holidays.',
          vi: 'Giờ làm việc của chúng tôi là từ Thứ Hai đến Thứ Sáu, từ 8:00 sáng đến 5:00 chiều (giờ Việt Nam). Chúng tôi đóng cửa vào cuối tuần và các ngày lễ.',
          zh: '我们的营业时间是周一至周五，上午8:00至下午5:00（越南时间）。周末和公共假期休息。',
          fr: 'Nos horaires d\'ouverture sont du lundi au vendredi, de 8h00 à 17h00 (heure du Vietnam). Nous sommes fermés le week-end et les jours fériés.',
        },
      },
      {
        id: '4',
        question: {
          en: 'Do you provide services internationally?',
          vi: 'Bạn có cung cấp dịch vụ quốc tế không?',
          zh: '您是否提供国际服务？',
          fr: 'Proposez-vous des services internationaux?',
        },
        answer: {
          en: 'Yes, we provide services to clients across Southeast Asia and globally. Please contact us to discuss your specific requirements and we will be happy to assist you.',
          vi: 'Có, chúng tôi cung cấp dịch vụ cho khách hàng trên khắp Đông Nam Á và toàn cầu. Vui lòng liên hệ với chúng tôi để thảo luận về yêu cầu cụ thể của bạn và chúng tôi sẽ sẵn sàng hỗ trợ bạn.',
          zh: '是的，我们为东南亚和全球的客户提供服务。请联系我们讨论您的具体需求，我们将很乐意为您提供帮助。',
          fr: 'Oui, nous proposons des services aux clients en Asie du Sud-Est et dans le monde entier. Veuillez nous contacter pour discuter de vos besoins spécifiques et nous serons heureux de vous aider.',
        },
      },
      {
        id: '5',
        question: {
          en: 'How do I get started with your investment services?',
          vi: 'Làm thế nào để tôi bắt đầu với dịch vụ đầu tư của bạn?',
          zh: '如何开始使用您的投资服务？',
          fr: 'Comment puis-je commencer avec vos services d\'investissement?',
        },
        answer: {
          en: 'To get started, please fill out our contact form or call us directly. Our team will guide you through the process and help you choose the best investment options for your needs.',
          vi: 'Để bắt đầu, vui lòng điền vào biểu mẫu liên hệ của chúng tôi hoặc gọi trực tiếp cho chúng tôi. Đội ngũ của chúng tôi sẽ hướng dẫn bạn qua quy trình và giúp bạn chọn các lựa chọn đầu tư tốt nhất cho nhu cầu của bạn.',
          zh: '要开始，请填写我们的联系表或直接致电我们。我们的团队将指导您完成流程，并帮助您选择最适合您需求的投资选项。',
          fr: 'Pour commencer, veuillez remplir notre formulaire de contact ou nous appeler directement. Notre équipe vous guidera tout au long du processus et vous aidera à choisir les meilleures options d\'investissement pour vos besoins.',
        },
      },
      {
        id: '6',
        question: {
          en: 'What payment methods do you accept?',
          vi: 'Bạn chấp nhận những phương thức thanh toán nào?',
          zh: '您接受哪些付款方式？',
          fr: 'Quels modes de paiement acceptez-vous?',
        },
        answer: {
          en: 'We accept various payment methods including bank transfers, credit cards, and other secure payment options. Our team will provide detailed payment information based on your selected service.',
          vi: 'Chúng tôi chấp nhận nhiều phương thức thanh toán bao gồm chuyển khoản ngân hàng, thẻ tín dụng và các tùy chọn thanh toán an toàn khác. Đội ngũ của chúng tôi sẽ cung cấp thông tin thanh toán chi tiết dựa trên dịch vụ bạn đã chọn.',
          zh: '我们接受各种付款方式，包括银行转账、信用卡和其他安全付款选项。我们的团队将根据您选择的服务提供详细的付款信息。',
          fr: 'Nous acceptons divers modes de paiement, notamment les virements bancaires, les cartes de crédit et d\'autres options de paiement sécurisées. Notre équipe fournira des informations de paiement détaillées en fonction du service que vous avez sélectionné.',
        },
      },
    ],
  },
  vi: {
    title: {
      en: 'Frequently Asked Questions',
      vi: 'Câu Hỏi Thường Gặp',
      zh: '常见问题',
      fr: 'Questions Fréquemment Posées',
    },
    subtitle: {
      en: 'Find answers to common questions about our services and products.',
      vi: 'Tìm câu trả lời cho các câu hỏi phổ biến về dịch vụ và sản phẩm của chúng tôi.',
      zh: '查找有关我们服务和产品的常见问题的答案。',
      fr: 'Trouvez des réponses aux questions courantes sur nos services et produits.',
    },
    items: [
      {
        id: '1',
        question: {
          en: 'What services does Dickson Investment Group offer?',
          vi: 'Dickson Investment Group cung cấp những dịch vụ gì?',
          zh: 'Dickson Investment Group 提供哪些服务？',
          fr: 'Quels services Dickson Investment Group propose-t-il?',
        },
        answer: {
          en: 'We offer a wide range of investment services including gold trading, wood products, paper production, and rice business. Our services are designed to meet diverse investment needs.',
          vi: 'Chúng tôi cung cấp nhiều loại dịch vụ đầu tư bao gồm giao dịch vàng, sản phẩm gỗ, sản xuất giấy và kinh doanh gạo. Các dịch vụ của chúng tôi được thiết kế để đáp ứng nhu cầu đầu tư đa dạng.',
          zh: '我们提供广泛的投资服务，包括黄金交易、木制品、造纸和大米业务。我们的服务旨在满足多样化的投资需求。',
          fr: 'Nous proposons une large gamme de services d\'investissement, notamment le trading d\'or, les produits en bois, la production de papier et le commerce du riz. Nos services sont conçus pour répondre à des besoins d\'investissement diversifiés.',
        },
      },
      {
        id: '2',
        question: {
          en: 'How can I contact customer support?',
          vi: 'Làm thế nào để tôi có thể liên hệ với bộ phận hỗ trợ khách hàng?',
          zh: '如何联系客户支持？',
          fr: 'Comment puis-je contacter le service client?',
        },
        answer: {
          en: 'You can contact us through our contact form on this page, call our hotline at +84 123 456 789, or email us at contact@dicksoninvestment.com. Our support team is available Monday to Friday, 8 AM to 5 PM.',
          vi: 'Bạn có thể liên hệ với chúng tôi qua biểu mẫu liên hệ trên trang này, gọi hotline +84 123 456 789, hoặc gửi email đến contact@dicksoninvestment.com. Đội ngũ hỗ trợ của chúng tôi có mặt từ Thứ Hai đến Thứ Sáu, 8 giờ sáng đến 5 giờ chiều.',
          zh: '您可以通过本页的联系表联系我们，拨打热线 +84 123 456 789，或发送电子邮件至 contact@dicksoninvestment.com。我们的支持团队周一至周五上午8点至下午5点提供服务。',
          fr: 'Vous pouvez nous contacter via notre formulaire de contact sur cette page, appeler notre hotline au +84 123 456 789, ou nous envoyer un email à contact@dicksoninvestment.com. Notre équipe de support est disponible du lundi au vendredi, de 8h à 17h.',
        },
      },
      {
        id: '3',
        question: {
          en: 'What are your business hours?',
          vi: 'Giờ làm việc của bạn là gì?',
          zh: '您的营业时间是什么？',
          fr: 'Quels sont vos horaires d\'ouverture?',
        },
        answer: {
          en: 'Our business hours are Monday through Friday, from 8:00 AM to 5:00 PM (Vietnam time). We are closed on weekends and public holidays.',
          vi: 'Giờ làm việc của chúng tôi là từ Thứ Hai đến Thứ Sáu, từ 8:00 sáng đến 5:00 chiều (giờ Việt Nam). Chúng tôi đóng cửa vào cuối tuần và các ngày lễ.',
          zh: '我们的营业时间是周一至周五，上午8:00至下午5:00（越南时间）。周末和公共假期休息。',
          fr: 'Nos horaires d\'ouverture sont du lundi au vendredi, de 8h00 à 17h00 (heure du Vietnam). Nous sommes fermés le week-end et les jours fériés.',
        },
      },
      {
        id: '4',
        question: {
          en: 'Do you provide services internationally?',
          vi: 'Bạn có cung cấp dịch vụ quốc tế không?',
          zh: '您是否提供国际服务？',
          fr: 'Proposez-vous des services internationaux?',
        },
        answer: {
          en: 'Yes, we provide services to clients across Southeast Asia and globally. Please contact us to discuss your specific requirements and we will be happy to assist you.',
          vi: 'Có, chúng tôi cung cấp dịch vụ cho khách hàng trên khắp Đông Nam Á và toàn cầu. Vui lòng liên hệ với chúng tôi để thảo luận về yêu cầu cụ thể của bạn và chúng tôi sẽ sẵn sàng hỗ trợ bạn.',
          zh: '是的，我们为东南亚和全球的客户提供服务。请联系我们讨论您的具体需求，我们将很乐意为您提供帮助。',
          fr: 'Oui, nous proposons des services aux clients en Asie du Sud-Est et dans le monde entier. Veuillez nous contacter pour discuter de vos besoins spécifiques et nous serons heureux de vous aider.',
        },
      },
      {
        id: '5',
        question: {
          en: 'How do I get started with your investment services?',
          vi: 'Làm thế nào để tôi bắt đầu với dịch vụ đầu tư của bạn?',
          zh: '如何开始使用您的投资服务？',
          fr: 'Comment puis-je commencer avec vos services d\'investissement?',
        },
        answer: {
          en: 'To get started, please fill out our contact form or call us directly. Our team will guide you through the process and help you choose the best investment options for your needs.',
          vi: 'Để bắt đầu, vui lòng điền vào biểu mẫu liên hệ của chúng tôi hoặc gọi trực tiếp cho chúng tôi. Đội ngũ của chúng tôi sẽ hướng dẫn bạn qua quy trình và giúp bạn chọn các lựa chọn đầu tư tốt nhất cho nhu cầu của bạn.',
          zh: '要开始，请填写我们的联系表或直接致电我们。我们的团队将指导您完成流程，并帮助您选择最适合您需求的投资选项。',
          fr: 'Pour commencer, veuillez remplir notre formulaire de contact ou nous appeler directement. Notre équipe vous guidera tout au long du processus et vous aidera à choisir les meilleures options d\'investissement pour vos besoins.',
        },
      },
      {
        id: '6',
        question: {
          en: 'What payment methods do you accept?',
          vi: 'Bạn chấp nhận những phương thức thanh toán nào?',
          zh: '您接受哪些付款方式？',
          fr: 'Quels modes de paiement acceptez-vous?',
        },
        answer: {
          en: 'We accept various payment methods including bank transfers, credit cards, and other secure payment options. Our team will provide detailed payment information based on your selected service.',
          vi: 'Chúng tôi chấp nhận nhiều phương thức thanh toán bao gồm chuyển khoản ngân hàng, thẻ tín dụng và các tùy chọn thanh toán an toàn khác. Đội ngũ của chúng tôi sẽ cung cấp thông tin thanh toán chi tiết dựa trên dịch vụ bạn đã chọn.',
          zh: '我们接受各种付款方式，包括银行转账、信用卡和其他安全付款选项。我们的团队将根据您选择的服务提供详细的付款信息。',
          fr: 'Nous acceptons divers modes de paiement, notamment les virements bancaires, les cartes de crédit et d\'autres options de paiement sécurisées. Notre équipe fournira des informations de paiement détaillées en fonction du service que vous avez sélectionné.',
        },
      },
    ],
  },
  zh: {
    title: {
      en: 'Frequently Asked Questions',
      vi: 'Câu Hỏi Thường Gặp',
      zh: '常见问题',
      fr: 'Questions Fréquemment Posées',
    },
    subtitle: {
      en: 'Find answers to common questions about our services and products.',
      vi: 'Tìm câu trả lời cho các câu hỏi phổ biến về dịch vụ và sản phẩm của chúng tôi.',
      zh: '查找有关我们服务和产品的常见问题的答案。',
      fr: 'Trouvez des réponses aux questions courantes sur nos services et produits.',
    },
    items: [
      {
        id: '1',
        question: {
          en: 'What services does Dickson Investment Group offer?',
          vi: 'Dickson Investment Group cung cấp những dịch vụ gì?',
          zh: 'Dickson Investment Group 提供哪些服务？',
          fr: 'Quels services Dickson Investment Group propose-t-il?',
        },
        answer: {
          en: 'We offer a wide range of investment services including gold trading, wood products, paper production, and rice business. Our services are designed to meet diverse investment needs.',
          vi: 'Chúng tôi cung cấp nhiều loại dịch vụ đầu tư bao gồm giao dịch vàng, sản phẩm gỗ, sản xuất giấy và kinh doanh gạo. Các dịch vụ của chúng tôi được thiết kế để đáp ứng nhu cầu đầu tư đa dạng.',
          zh: '我们提供广泛的投资服务，包括黄金交易、木制品、造纸和大米业务。我们的服务旨在满足多样化的投资需求。',
          fr: 'Nous proposons une large gamme de services d\'investissement, notamment le trading d\'or, les produits en bois, la production de papier et le commerce du riz. Nos services sont conçus pour répondre à des besoins d\'investissement diversifiés.',
        },
      },
      {
        id: '2',
        question: {
          en: 'How can I contact customer support?',
          vi: 'Làm thế nào để tôi có thể liên hệ với bộ phận hỗ trợ khách hàng?',
          zh: '如何联系客户支持？',
          fr: 'Comment puis-je contacter le service client?',
        },
        answer: {
          en: 'You can contact us through our contact form on this page, call our hotline at +84 123 456 789, or email us at contact@dicksoninvestment.com. Our support team is available Monday to Friday, 8 AM to 5 PM.',
          vi: 'Bạn có thể liên hệ với chúng tôi qua biểu mẫu liên hệ trên trang này, gọi hotline +84 123 456 789, hoặc gửi email đến contact@dicksoninvestment.com. Đội ngũ hỗ trợ của chúng tôi có mặt từ Thứ Hai đến Thứ Sáu, 8 giờ sáng đến 5 giờ chiều.',
          zh: '您可以通过本页的联系表联系我们，拨打热线 +84 123 456 789，或发送电子邮件至 contact@dicksoninvestment.com。我们的支持团队周一至周五上午8点至下午5点提供服务。',
          fr: 'Vous pouvez nous contacter via notre formulaire de contact sur cette page, appeler notre hotline au +84 123 456 789, ou nous envoyer un email à contact@dicksoninvestment.com. Notre équipe de support est disponible du lundi au vendredi, de 8h à 17h.',
        },
      },
      {
        id: '3',
        question: {
          en: 'What are your business hours?',
          vi: 'Giờ làm việc của bạn là gì?',
          zh: '您的营业时间是什么？',
          fr: 'Quels sont vos horaires d\'ouverture?',
        },
        answer: {
          en: 'Our business hours are Monday through Friday, from 8:00 AM to 5:00 PM (Vietnam time). We are closed on weekends and public holidays.',
          vi: 'Giờ làm việc của chúng tôi là từ Thứ Hai đến Thứ Sáu, từ 8:00 sáng đến 5:00 chiều (giờ Việt Nam). Chúng tôi đóng cửa vào cuối tuần và các ngày lễ.',
          zh: '我们的营业时间是周一至周五，上午8:00至下午5:00（越南时间）。周末和公共假期休息。',
          fr: 'Nos horaires d\'ouverture sont du lundi au vendredi, de 8h00 à 17h00 (heure du Vietnam). Nous sommes fermés le week-end et les jours fériés.',
        },
      },
      {
        id: '4',
        question: {
          en: 'Do you provide services internationally?',
          vi: 'Bạn có cung cấp dịch vụ quốc tế không?',
          zh: '您是否提供国际服务？',
          fr: 'Proposez-vous des services internationaux?',
        },
        answer: {
          en: 'Yes, we provide services to clients across Southeast Asia and globally. Please contact us to discuss your specific requirements and we will be happy to assist you.',
          vi: 'Có, chúng tôi cung cấp dịch vụ cho khách hàng trên khắp Đông Nam Á và toàn cầu. Vui lòng liên hệ với chúng tôi để thảo luận về yêu cầu cụ thể của bạn và chúng tôi sẽ sẵn sàng hỗ trợ bạn.',
          zh: '是的，我们为东南亚和全球的客户提供服务。请联系我们讨论您的具体需求，我们将很乐意为您提供帮助。',
          fr: 'Oui, nous proposons des services aux clients en Asie du Sud-Est et dans le monde entier. Veuillez nous contacter pour discuter de vos besoins spécifiques et nous serons heureux de vous aider.',
        },
      },
      {
        id: '5',
        question: {
          en: 'How do I get started with your investment services?',
          vi: 'Làm thế nào để tôi bắt đầu với dịch vụ đầu tư của bạn?',
          zh: '如何开始使用您的投资服务？',
          fr: 'Comment puis-je commencer avec vos services d\'investissement?',
        },
        answer: {
          en: 'To get started, please fill out our contact form or call us directly. Our team will guide you through the process and help you choose the best investment options for your needs.',
          vi: 'Để bắt đầu, vui lòng điền vào biểu mẫu liên hệ của chúng tôi hoặc gọi trực tiếp cho chúng tôi. Đội ngũ của chúng tôi sẽ hướng dẫn bạn qua quy trình và giúp bạn chọn các lựa chọn đầu tư tốt nhất cho nhu cầu của bạn.',
          zh: '要开始，请填写我们的联系表或直接致电我们。我们的团队将指导您完成流程，并帮助您选择最适合您需求的投资选项。',
          fr: 'Pour commencer, veuillez remplir notre formulaire de contact ou nous appeler directement. Notre équipe vous guidera tout au long du processus et vous aidera à choisir les meilleures options d\'investissement pour vos besoins.',
        },
      },
      {
        id: '6',
        question: {
          en: 'What payment methods do you accept?',
          vi: 'Bạn chấp nhận những phương thức thanh toán nào?',
          zh: '您接受哪些付款方式？',
          fr: 'Quels modes de paiement acceptez-vous?',
        },
        answer: {
          en: 'We accept various payment methods including bank transfers, credit cards, and other secure payment options. Our team will provide detailed payment information based on your selected service.',
          vi: 'Chúng tôi chấp nhận nhiều phương thức thanh toán bao gồm chuyển khoản ngân hàng, thẻ tín dụng và các tùy chọn thanh toán an toàn khác. Đội ngũ của chúng tôi sẽ cung cấp thông tin thanh toán chi tiết dựa trên dịch vụ bạn đã chọn.',
          zh: '我们接受各种付款方式，包括银行转账、信用卡和其他安全付款选项。我们的团队将根据您选择的服务提供详细的付款信息。',
          fr: 'Nous acceptons divers modes de paiement, notamment les virements bancaires, les cartes de crédit et d\'autres options de paiement sécurisées. Notre équipe fournira des informations de paiement détaillées en fonction du service que vous avez sélectionné.',
        },
      },
    ],
  },
  fr: {
    title: {
      en: 'Frequently Asked Questions',
      vi: 'Câu Hỏi Thường Gặp',
      zh: '常见问题',
      fr: 'Questions Fréquemment Posées',
    },
    subtitle: {
      en: 'Find answers to common questions about our services and products.',
      vi: 'Tìm câu trả lời cho các câu hỏi phổ biến về dịch vụ và sản phẩm của chúng tôi.',
      zh: '查找有关我们服务和产品的常见问题的答案。',
      fr: 'Trouvez des réponses aux questions courantes sur nos services et produits.',
    },
    items: [
      {
        id: '1',
        question: {
          en: 'What services does Dickson Investment Group offer?',
          vi: 'Dickson Investment Group cung cấp những dịch vụ gì?',
          zh: 'Dickson Investment Group 提供哪些服务？',
          fr: 'Quels services Dickson Investment Group propose-t-il?',
        },
        answer: {
          en: 'We offer a wide range of investment services including gold trading, wood products, paper production, and rice business. Our services are designed to meet diverse investment needs.',
          vi: 'Chúng tôi cung cấp nhiều loại dịch vụ đầu tư bao gồm giao dịch vàng, sản phẩm gỗ, sản xuất giấy và kinh doanh gạo. Các dịch vụ của chúng tôi được thiết kế để đáp ứng nhu cầu đầu tư đa dạng.',
          zh: '我们提供广泛的投资服务，包括黄金交易、木制品、造纸和大米业务。我们的服务旨在满足多样化的投资需求。',
          fr: 'Nous proposons une large gamme de services d\'investissement, notamment le trading d\'or, les produits en bois, la production de papier et le commerce du riz. Nos services sont conçus pour répondre à des besoins d\'investissement diversifiés.',
        },
      },
      {
        id: '2',
        question: {
          en: 'How can I contact customer support?',
          vi: 'Làm thế nào để tôi có thể liên hệ với bộ phận hỗ trợ khách hàng?',
          zh: '如何联系客户支持？',
          fr: 'Comment puis-je contacter le service client?',
        },
        answer: {
          en: 'You can contact us through our contact form on this page, call our hotline at +84 123 456 789, or email us at contact@dicksoninvestment.com. Our support team is available Monday to Friday, 8 AM to 5 PM.',
          vi: 'Bạn có thể liên hệ với chúng tôi qua biểu mẫu liên hệ trên trang này, gọi hotline +84 123 456 789, hoặc gửi email đến contact@dicksoninvestment.com. Đội ngũ hỗ trợ của chúng tôi có mặt từ Thứ Hai đến Thứ Sáu, 8 giờ sáng đến 5 giờ chiều.',
          zh: '您可以通过本页的联系表联系我们，拨打热线 +84 123 456 789，或发送电子邮件至 contact@dicksoninvestment.com。我们的支持团队周一至周五上午8点至下午5点提供服务。',
          fr: 'Vous pouvez nous contacter via notre formulaire de contact sur cette page, appeler notre hotline au +84 123 456 789, ou nous envoyer un email à contact@dicksoninvestment.com. Notre équipe de support est disponible du lundi au vendredi, de 8h à 17h.',
        },
      },
      {
        id: '3',
        question: {
          en: 'What are your business hours?',
          vi: 'Giờ làm việc của bạn là gì?',
          zh: '您的营业时间是什么？',
          fr: 'Quels sont vos horaires d\'ouverture?',
        },
        answer: {
          en: 'Our business hours are Monday through Friday, from 8:00 AM to 5:00 PM (Vietnam time). We are closed on weekends and public holidays.',
          vi: 'Giờ làm việc của chúng tôi là từ Thứ Hai đến Thứ Sáu, từ 8:00 sáng đến 5:00 chiều (giờ Việt Nam). Chúng tôi đóng cửa vào cuối tuần và các ngày lễ.',
          zh: '我们的营业时间是周一至周五，上午8:00至下午5:00（越南时间）。周末和公共假期休息。',
          fr: 'Nos horaires d\'ouverture sont du lundi au vendredi, de 8h00 à 17h00 (heure du Vietnam). Nous sommes fermés le week-end et les jours fériés.',
        },
      },
      {
        id: '4',
        question: {
          en: 'Do you provide services internationally?',
          vi: 'Bạn có cung cấp dịch vụ quốc tế không?',
          zh: '您是否提供国际服务？',
          fr: 'Proposez-vous des services internationaux?',
        },
        answer: {
          en: 'Yes, we provide services to clients across Southeast Asia and globally. Please contact us to discuss your specific requirements and we will be happy to assist you.',
          vi: 'Có, chúng tôi cung cấp dịch vụ cho khách hàng trên khắp Đông Nam Á và toàn cầu. Vui lòng liên hệ với chúng tôi để thảo luận về yêu cầu cụ thể của bạn và chúng tôi sẽ sẵn sàng hỗ trợ bạn.',
          zh: '是的，我们为东南亚和全球的客户提供服务。请联系我们讨论您的具体需求，我们将很乐意为您提供帮助。',
          fr: 'Oui, nous proposons des services aux clients en Asie du Sud-Est et dans le monde entier. Veuillez nous contacter pour discuter de vos besoins spécifiques et nous serons heureux de vous aider.',
        },
      },
      {
        id: '5',
        question: {
          en: 'How do I get started with your investment services?',
          vi: 'Làm thế nào để tôi bắt đầu với dịch vụ đầu tư của bạn?',
          zh: '如何开始使用您的投资服务？',
          fr: 'Comment puis-je commencer avec vos services d\'investissement?',
        },
        answer: {
          en: 'To get started, please fill out our contact form or call us directly. Our team will guide you through the process and help you choose the best investment options for your needs.',
          vi: 'Để bắt đầu, vui lòng điền vào biểu mẫu liên hệ của chúng tôi hoặc gọi trực tiếp cho chúng tôi. Đội ngũ của chúng tôi sẽ hướng dẫn bạn qua quy trình và giúp bạn chọn các lựa chọn đầu tư tốt nhất cho nhu cầu của bạn.',
          zh: '要开始，请填写我们的联系表或直接致电我们。我们的团队将指导您完成流程，并帮助您选择最适合您需求的投资选项。',
          fr: 'Pour commencer, veuillez remplir notre formulaire de contact ou nous appeler directement. Notre équipe vous guidera tout au long du processus et vous aidera à choisir les meilleures options d\'investissement pour vos besoins.',
        },
      },
      {
        id: '6',
        question: {
          en: 'What payment methods do you accept?',
          vi: 'Bạn chấp nhận những phương thức thanh toán nào?',
          zh: '您接受哪些付款方式？',
          fr: 'Quels modes de paiement acceptez-vous?',
        },
        answer: {
          en: 'We accept various payment methods including bank transfers, credit cards, and other secure payment options. Our team will provide detailed payment information based on your selected service.',
          vi: 'Chúng tôi chấp nhận nhiều phương thức thanh toán bao gồm chuyển khoản ngân hàng, thẻ tín dụng và các tùy chọn thanh toán an toàn khác. Đội ngũ của chúng tôi sẽ cung cấp thông tin thanh toán chi tiết dựa trên dịch vụ bạn đã chọn.',
          zh: '我们接受各种付款方式，包括银行转账、信用卡和其他安全付款选项。我们的团队将根据您选择的服务提供详细的付款信息。',
          fr: 'Nous acceptons divers modes de paiement, notamment les virements bancaires, les cartes de crédit et d\'autres options de paiement sécurisées. Notre équipe fournira des informations de paiement détaillées en fonction du service que vous avez sélectionné.',
        },
      },
    ],
  },
};

export const SUPPORT_CONTENT: Record<Language, SupportContent> = {
  en: {
    greeting: 'Welcome to DICKSON INVESTMENT GROUP Support',
    question: 'How can we help you today?',
    searchPlaceholder: 'Search for help topics...',
  },
  vi: {
    greeting: 'Chào mừng đến với Dịch vụ Hỗ trợ DICKSON INVESTMENT GROUP',
    question: 'Chúng tôi có thể giúp gì cho bạn hôm nay?',
    searchPlaceholder: 'Tìm kiếm chủ đề hỗ trợ...',
  },
  zh: {
    greeting: '欢迎来到 DICKSON INVESTMENT GROUP 支持中心',
    question: '我们今天能为您提供什么帮助？',
    searchPlaceholder: '搜索帮助主题...',
  },
  fr: {
    greeting: 'Bienvenue au Support DICKSON INVESTMENT GROUP',
    question: 'Comment pouvons-nous vous aider aujourd\'hui?',
    searchPlaceholder: 'Rechercher des sujets d\'aide...',
  },
};
