import { Language, ContactContent, FAQContent, SupportContent } from '@/types';

export const CONTACT_INFO_LABELS: Record<Language, { address: string; phone: string; fax: string; hotline: string }> = {
  en: { address: 'Address', phone: 'Phone', fax: 'Fax', hotline: 'Hotline' },
};

export const CONTACT_CONTENT: Record<Language, ContactContent> = {
  en: {
    title: { en: 'CONTACT US' },
    subtitle: { en: 'ORIGIN TRACEABILITY — GET IN TOUCH' },
    form: {
      topic: { en: 'Topic' },
      topicPlaceholder: { en: 'Please select the topic you want to respond to' },
      topics: {
        general: { en: 'General Inquiry' },
        support: { en: 'Support' },
        feedback: { en: 'Feedback' },
      },
      messageLabel: { en: 'Question / Your feedback' },
      name: { en: 'Full Name' },
      namePlaceholder: { en: 'Enter your full name' },
      email: { en: 'Email Address' },
      emailPlaceholder: { en: 'Enter your email address' },
      phone: { en: 'Phone Number' },
      phonePlaceholder: { en: 'Enter your phone number' },
      subject: { en: 'Subject' },
      subjectPlaceholder: { en: 'Enter subject' },
      message: { en: 'Message' },
      messagePlaceholder: { en: 'Enter your message here...' },
      submit: { en: 'SEND' },
    },
    info: {
      description: {
        en: 'We value your feedback. Our team supports traceability inquiries, product verification, and partnership opportunities. Customer care is available to help you verify origin data and integrate our solutions.',
      },
      address: { en: 'Lot D26, Cau Giay New Urban Area, Cau Giay Ward, Hanoi City.' },
      phone: { en: '18008098' },
      fax: { en: '024 6255 6789' },
      hotline: { en: '18008098' },
    },
  },
};

export const FAQ_CONTENT: Record<Language, FAQContent> = {
  en: {
    title: { en: 'FREQUENTLY ASKED QUESTIONS' },
    subtitle: {
      en: 'Find answers to common questions about origin traceability and our services.',
    },
    items: [
      {
        id: '1',
        question: { en: 'What is origin traceability?' },
        answer: {
          en: 'Origin traceability is the ability to track and verify where a product came from and how it moved through the supply chain — from farm or factory to the end consumer. We provide tools and data so you can verify source, authenticity, and journey.',
        },
      },
      {
        id: '2',
        question: { en: 'How can I verify a product’s origin?' },
        answer: {
          en: 'Use the QR code or traceability ID on the product to look up its record on our platform. You will see verified data on origin, processing steps, and journey. For bulk or B2B verification, contact us for API or dashboard access.',
        },
      },
      {
        id: '3',
        question: { en: 'How do I contact customer support?' },
        answer: {
          en: 'You can use the contact form on this page, call our hotline at +84 123 456 789, or email contact@traceability.vn. Our support team is available Monday to Friday, 8 AM to 5 PM (Vietnam time).',
        },
      },
      {
        id: '4',
        question: { en: 'Do you provide traceability services internationally?' },
        answer: {
          en: 'Yes. We work with producers, brands, and retailers across Southeast Asia and other regions. Contact us to discuss your supply chain and we can tailor solutions for your markets.',
        },
      },
      {
        id: '5',
        question: { en: 'How do I get started with your traceability solutions?' },
        answer: {
          en: 'Fill out our contact form or call us. Our team will guide you through onboarding: registering your products, setting up tracking, and connecting with your supply chain. We support small producers and large enterprises.',
        },
      },
      {
        id: '6',
        question: { en: 'What standards do you follow for traceability?' },
        answer: {
          en: 'We follow internationally recognized traceability and data standards so our solutions work with regulations and trading partners. We can align with your industry and certification requirements.',
        },
      },
    ],
  },
};

export const SUPPORT_CONTENT: Record<Language, SupportContent> = {
  en: {
    greeting: 'Welcome to Origin Traceability Support',
    question: 'How can we help you today?',
    searchPlaceholder: 'Search for help topics...',
  },
};
