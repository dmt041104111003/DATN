export type Product = {
  id: number;
  slug: string;
  nameEn: string;
  descriptionEn: string | null;
  imageUrl: string | null;
};

export type Account = {
  id: number;
  displayName: string;
  stakeAddress: string;
  glnCodeRoot: string | null;
  roleCode: string;
  avatarUrl?: string | null;
};

export type ProductListItem = {
  id: number;
  slug: string;
  nameEn: string;
};

export type Role = {
  id: number;
  code: string;
};

export type ProfileFormProps = {
  displayName: string;
  glnCodeRoot: string;
  onChangeDisplayName: (value: string) => void;
  onChangeGlnCodeRoot: (value: string) => void;
  disabled?: boolean;
  showGln: boolean;
};

export type RoleSelectProps = {
  roles: Role[];
  selectedRoleId: number | null;
  onChange: (id: number | null) => void;
  disabled?: boolean;
};

export type ProfileSetupState = {
  stakeAddress: string;
  roles: Role[];
};

export type AccountProfileProps = {
  account: Account | null;
  isMobile: boolean;
  uploading: boolean;
  loading: boolean;
  error: string;
  saved: boolean;
  displayName: string;
  glnCodeRoot: string;
  showGln: boolean;
  onChangeDisplayName: (value: string) => void;
  onChangeGlnCodeRoot: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onChangeAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
