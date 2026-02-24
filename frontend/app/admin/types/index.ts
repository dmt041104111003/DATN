export type Product = {
  id: number;
  slug: string;
  nameEn: string;
  descriptionEn: string | null;
  imageUrl: string | null;
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
