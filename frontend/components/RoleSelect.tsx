type Role = { id: number; code: string };

export function RoleSelect({
  roles,
  selectedRoleId,
  onChange,
  disabled,
}: {
  roles: Role[];
  selectedRoleId: number | null;
  onChange: (id: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="role-select-field">
      <span className="role-select-label">Select role</span>
      <div className="role-select-grid">
        {roles.map((role) => {
          const isActive = role.id === selectedRoleId;
          return (
            <button
              key={role.id}
              type="button"
              className={`role-select-card${
                isActive ? " role-select-cardActive" : ""
              }`}
              onClick={() => onChange(role.id)}
              disabled={disabled}
              aria-pressed={isActive}
            >
              <span className="role-select-code">{role.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

