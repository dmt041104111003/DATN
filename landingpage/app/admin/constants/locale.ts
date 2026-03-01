import type { LangId } from './admin';

export type ProductAdminLocale = {
  pageTitle: string;
  addProduct: string;
  searchPlaceholder: string;
  allCategories: string;
  selectCategory: string;
  id: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  youtube: string;
  order: string;
  actions: string;
  edit: string;
  delete: string;
  editProduct: string;
  addProductTitle: string;
  close: string;
  type: string;
  descriptionBlocks: string;
  blockLabel: string;
  blockTitle: string;
  removeBlock: string;
  imageInBlock: string;
  linkYoutube: string;
  addDescription: string;
  mainImage: string;
  uploadImage: string;
  uploading: string;
  save: string;
  saving: string;
  cancel: string;
  errorUpdate: string;
  errorCreate: string;
  errorConnection: string;
  confirmDelete: string;
  chooseImageFile: string;
  uploadFailed: string;
  hasImage: string;
};

export type SidebarAdminLocale = {
  navCategories: string;
  navProducts: string;
  logout: string;
  openMenu: string;
  closeMenu: string;
};

export type LoginAdminLocale = {
  title: string;
  subtitle: string;
  username: string;
  password: string;
  clear: string;
  login: string;
  loggingIn: string;
  errorLogin: string;
  errorConnection: string;
};

export type CategoryAdminLocale = {
  pageTitle: string;
  addCategory: string;
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  order: string;
  actions: string;
  edit: string;
  delete: string;
  editCategory: string;
  addCategoryTitle: string;
  close: string;
  selectCategory: string;
  save: string;
  cancel: string;
  confirmDelete: string;
  chooseImageFile: string;
  uploadImage: string;
  placeholderDesc: string;
  uploading: string;
  saving: string;
  errorUpdate: string;
  errorCreate: string;
  errorConnection: string;
  uploadFailed: string;
  hasImage: string;
};

export type CommonAdminLocale = {
  noData: string;
  showRange: string;
  pagination: string;
  paginationAriaLabel: string;
  prevPage: string;
  nextPage: string;
  page: string;
};

const PRODUCT_LOCALE: Record<LangId, ProductAdminLocale> = {
  en: {
    pageTitle: 'Product management',
    addProduct: 'Add product',
    searchPlaceholder: 'Search by name or ID...',
    allCategories: 'All categories',
    selectCategory: '-- Select category --',
    id: 'ID',
    slug: 'Slug',
    name: 'Name',
    category: 'Category',
    image: 'Image',
    youtube: 'YouTube',
    order: 'Order',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    editProduct: 'Edit product',
    addProductTitle: 'Add product',
    close: 'Close',
    type: 'Type',
    descriptionBlocks: 'Description',
    blockLabel: 'Description',
    blockTitle: 'Section title',
    removeBlock: 'Delete',
    imageInBlock: 'Image',
    linkYoutube: 'YouTube link',
    addDescription: 'Add',
    mainImage: 'Main image',
    uploadImage: 'Upload image',
    uploading: 'Uploading...',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    errorUpdate: 'Update failed',
    errorCreate: 'Create failed',
    errorConnection: 'Connection error',
    confirmDelete: 'Are you sure you want to delete this product?',
    chooseImageFile: 'Please choose an image file (jpg, png, webp...)',
    uploadFailed: 'Upload failed',
    hasImage: 'Yes',
  },
  vi: {
    pageTitle: 'Quản lý sản phẩm',
    addProduct: 'Thêm sản phẩm',
    searchPlaceholder: 'Tìm theo tên hoặc ID...',
    allCategories: 'Tất cả loại',
    selectCategory: '-- Chọn loại --',
    id: 'ID',
    slug: 'Slug',
    name: 'Tên',
    category: 'Loại',
    image: 'Ảnh',
    youtube: 'YouTube',
    order: 'Thứ tự',
    actions: 'Thao tác',
    edit: 'Sửa',
    delete: 'Xóa',
    editProduct: 'Sửa sản phẩm',
    addProductTitle: 'Thêm sản phẩm',
    close: 'Đóng',
    type: 'Loại',
    descriptionBlocks: 'Mô tả',
    blockLabel: 'Mô tả',
    blockTitle: 'Tên mục',
    removeBlock: 'Xóa',
    imageInBlock: 'Ảnh',
    linkYoutube: 'Link YouTube',
    addDescription: 'Thêm',
    mainImage: 'Ảnh chính',
    uploadImage: 'Tải ảnh',
    uploading: 'Đang tải...',
    save: 'Lưu',
    saving: 'Đang lưu...',
    cancel: 'Hủy',
    errorUpdate: 'Lỗi cập nhật',
    errorCreate: 'Lỗi thêm mới',
    errorConnection: 'Lỗi kết nối',
    confirmDelete: 'Bạn có chắc muốn xóa sản phẩm này?',
    chooseImageFile: 'Vui lòng chọn file ảnh jpg, png, webp...',
    uploadFailed: 'Tải ảnh lên thất bại',
    hasImage: 'Có',
  },
  zh: {
    pageTitle: '产品管理',
    addProduct: '添加产品',
    searchPlaceholder: '按名称或ID搜索...',
    allCategories: '全部分类',
    selectCategory: '-- 选择分类 --',
    id: 'ID',
    slug: 'Slug',
    name: '名称',
    category: '分类',
    image: '图片',
    youtube: 'YouTube',
    order: '顺序',
    actions: '操作',
    edit: '编辑',
    delete: '删除',
    editProduct: '编辑产品',
    addProductTitle: '添加产品',
    close: '关闭',
    type: '类型',
    descriptionBlocks: '描述',
    blockLabel: '描述',
    blockTitle: '栏目名称',
    removeBlock: '删除',
    imageInBlock: '图片',
    linkYoutube: 'YouTube链接',
    addDescription: '添加',
    mainImage: '主图',
    uploadImage: '上传图片',
    uploading: '上传中...',
    save: '保存',
    saving: '保存中...',
    cancel: '取消',
    errorUpdate: '更新失败',
    errorCreate: '创建失败',
    errorConnection: '连接错误',
    confirmDelete: '确定要删除此产品吗？',
    chooseImageFile: '请选择图片文件 jpg, png, webp...',
    uploadFailed: '上传失败',
    hasImage: '有',
  },
  fr: {
    pageTitle: 'Gestion des produits',
    addProduct: 'Ajouter un produit',
    searchPlaceholder: 'Rechercher par nom ou ID...',
    allCategories: 'Toutes les catégories',
    selectCategory: '-- Choisir une catégorie --',
    id: 'ID',
    slug: 'Slug',
    name: 'Nom',
    category: 'Catégorie',
    image: 'Image',
    youtube: 'YouTube',
    order: 'Ordre',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    editProduct: 'Modifier le produit',
    addProductTitle: 'Ajouter un produit',
    close: 'Fermer',
    type: 'Type',
    descriptionBlocks: 'Description',
    blockLabel: 'Description',
    blockTitle: 'Titre de section',
    removeBlock: 'Supprimer',
    imageInBlock: 'Image',
    linkYoutube: 'Lien YouTube',
    addDescription: 'Ajouter',
    mainImage: 'Image principale',
    uploadImage: 'Télécharger l\'image',
    uploading: 'Téléchargement...',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    cancel: 'Annuler',
    errorUpdate: 'Échec de la mise à jour',
    errorCreate: 'Échec de la création',
    errorConnection: 'Erreur de connexion',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
    chooseImageFile: 'Veuillez choisir un fichier image jpg, png, webp...',
    uploadFailed: 'Échec du téléchargement',
    hasImage: 'Oui',
  },
};

const SIDEBAR_LOCALE: Record<LangId, SidebarAdminLocale> = {
  en: {
    navCategories: 'Category management',
    navProducts: 'Product management',
    logout: 'Log out',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  vi: {
    navCategories: 'Quản lý loại',
    navProducts: 'Quản lý sản phẩm',
    logout: 'Đăng xuất',
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
  },
  zh: {
    navCategories: '分类管理',
    navProducts: '产品管理',
    logout: '退出登录',
    openMenu: '打开菜单',
    closeMenu: '关闭菜单',
  },
  fr: {
    navCategories: 'Gestion des catégories',
    navProducts: 'Gestion des produits',
    logout: 'Déconnexion',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
  },
};

const LOGIN_LOCALE: Record<LangId, LoginAdminLocale> = {
  en: {
    title: 'Login',
    subtitle: 'Admin',
    username: 'Username',
    password: 'Password',
    clear: 'Clear',
    login: 'Login',
    loggingIn: 'Logging in...',
    errorLogin: 'Login failed',
    errorConnection: 'Server connection error',
  },
  vi: {
    title: 'Đăng nhập',
    subtitle: 'Quản trị',
    username: 'Tài khoản',
    password: 'Mật khẩu',
    clear: 'Xóa',
    login: 'Đăng nhập',
    loggingIn: 'Đang đăng nhập...',
    errorLogin: 'Đăng nhập thất bại',
    errorConnection: 'Lỗi kết nối server',
  },
  zh: {
    title: '登录',
    subtitle: '管理后台',
    username: '用户名',
    password: '密码',
    clear: '清除',
    login: '登录',
    loggingIn: '登录中...',
    errorLogin: '登录失败',
    errorConnection: '服务器连接错误',
  },
  fr: {
    title: 'Connexion',
    subtitle: 'Administration',
    username: 'Identifiant',
    password: 'Mot de passe',
    clear: 'Effacer',
    login: 'Se connecter',
    loggingIn: 'Connexion...',
    errorLogin: 'Échec de connexion',
    errorConnection: 'Erreur de connexion au serveur',
  },
};

const CATEGORY_LOCALE: Record<LangId, CategoryAdminLocale> = {
  en: {
    pageTitle: 'Category management',
    addCategory: 'Add category',
    id: 'ID',
    name: 'Name',
    description: 'Description',
    image: 'Image',
    icon: 'Icon',
    order: 'Order',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    editCategory: 'Edit category',
    addCategoryTitle: 'Add category',
    close: 'Close',
    selectCategory: '-- Select category --',
    save: 'Save',
    cancel: 'Cancel',
    confirmDelete: 'Are you sure you want to delete this category?',
    chooseImageFile: 'Please choose an image file (jpg, png, webp...)',
    uploadImage: 'Upload image',
    placeholderDesc: 'Category description',
    uploading: 'Uploading...',
    saving: 'Saving...',
    errorUpdate: 'Update failed',
    errorCreate: 'Create failed',
    errorConnection: 'Connection error',
    uploadFailed: 'Upload failed',
    hasImage: 'Yes',
  },
  vi: {
    pageTitle: 'Quản lý loại',
    addCategory: 'Thêm loại',
    id: 'ID',
    name: 'Tên',
    description: 'Mô tả',
    image: 'Ảnh',
    icon: 'Icon',
    order: 'Thứ tự',
    actions: 'Thao tác',
    edit: 'Sửa',
    delete: 'Xóa',
    editCategory: 'Sửa loại',
    addCategoryTitle: 'Thêm loại',
    close: 'Đóng',
    selectCategory: '-- Chọn loại --',
    save: 'Lưu',
    cancel: 'Hủy',
    confirmDelete: 'Bạn có chắc muốn xóa loại này?',
    chooseImageFile: 'Vui lòng chọn file ảnh jpg, png, webp...',
    uploadImage: 'Tải ảnh',
    placeholderDesc: 'Mô tả loại sản phẩm',
    uploading: 'Đang tải...',
    saving: 'Đang lưu...',
    errorUpdate: 'Lỗi cập nhật',
    errorCreate: 'Lỗi thêm mới',
    errorConnection: 'Lỗi kết nối',
    uploadFailed: 'Tải ảnh lên thất bại',
    hasImage: 'Có',
  },
  zh: {
    pageTitle: '分类管理',
    addCategory: '添加分类',
    id: 'ID',
    name: '名称',
    description: '描述',
    image: '图片',
    icon: '图标',
    order: '顺序',
    actions: '操作',
    edit: '编辑',
    delete: '删除',
    editCategory: '编辑分类',
    addCategoryTitle: '添加分类',
    close: '关闭',
    selectCategory: '-- 选择分类 --',
    save: '保存',
    cancel: '取消',
    confirmDelete: '确定要删除此分类吗？',
    chooseImageFile: '请选择图片文件 jpg, png, webp...',
    uploadImage: '上传图片',
    placeholderDesc: '类别描述',
    uploading: '上传中...',
    saving: '保存中...',
    errorUpdate: '更新失败',
    errorCreate: '创建失败',
    errorConnection: '连接错误',
    uploadFailed: '上传失败',
    hasImage: '有',
  },
  fr: {
    pageTitle: 'Gestion des catégories',
    addCategory: 'Ajouter une catégorie',
    id: 'ID',
    name: 'Nom',
    description: 'Description',
    image: 'Image',
    icon: 'Icône',
    order: 'Ordre',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    editCategory: 'Modifier la catégorie',
    addCategoryTitle: 'Ajouter une catégorie',
    close: 'Fermer',
    selectCategory: '-- Choisir une catégorie --',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
    chooseImageFile: 'Veuillez choisir un fichier image jpg, png, webp...',
    uploadImage: 'Télécharger l\'image',
    placeholderDesc: 'Description de la catégorie',
    uploading: 'Téléchargement...',
    saving: 'Enregistrement...',
    errorUpdate: 'Échec de la mise à jour',
    errorCreate: 'Échec de la création',
    errorConnection: 'Erreur de connexion',
    uploadFailed: 'Échec du téléchargement',
    hasImage: 'Oui',
  },
};

const COMMON_LOCALE: Record<LangId, CommonAdminLocale> = {
  en: {
    noData: 'No data',
    showRange: 'Show',
    pagination: 'Pagination',
    paginationAriaLabel: 'Pagination',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    page: 'Page',
  },
  vi: {
    noData: 'Không có dữ liệu',
    showRange: 'Hiển thị',
    pagination: 'Phân trang',
    paginationAriaLabel: 'Phân trang',
    prevPage: 'Trang trước',
    nextPage: 'Trang sau',
    page: 'Trang',
  },
  zh: {
    noData: '暂无数据',
    showRange: '显示',
    pagination: '分页',
    paginationAriaLabel: '分页',
    prevPage: '上一页',
    nextPage: '下一页',
    page: '页',
  },
  fr: {
    noData: 'Aucune donnée',
    showRange: 'Afficher',
    pagination: 'Pagination',
    paginationAriaLabel: 'Pagination',
    prevPage: 'Page précédente',
    nextPage: 'Page suivante',
    page: 'Page',
  },
};

export function getProductLocale(lang: LangId): ProductAdminLocale {
  return PRODUCT_LOCALE[lang];
}

export function getCategoryLocale(lang: LangId): CategoryAdminLocale {
  return CATEGORY_LOCALE[lang];
}

export function getCommonLocale(lang: LangId): CommonAdminLocale {
  return COMMON_LOCALE[lang];
}

export function getSidebarLocale(lang: LangId): SidebarAdminLocale {
  return SIDEBAR_LOCALE[lang];
}

export function getLoginLocale(lang: LangId): LoginAdminLocale {
  return LOGIN_LOCALE[lang];
}
