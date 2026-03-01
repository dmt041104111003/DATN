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
  roleCode: string;
  avatarUrl?: string | null;
  location?: string | null;
  coordinates?: string | null;
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
  onChangeDisplayName: (value: string) => void;
  location: string;
  onChangeLocation: (value: string) => void;
  coordinates: string;
  onChangeCoordinates: (value: string) => void;
  disabled?: boolean;
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
  onChangeDisplayName: (value: string) => void;
  location: string;
  onChangeLocation: (value: string) => void;
  coordinates: string;
  onChangeCoordinates: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onChangeAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
