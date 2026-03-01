type Props = {
  styles: Record<string, string>;
  query: string;
  onChange: (next: string) => void;
};

export function WarehouseSearch({ styles, query, onChange }: Props) {
  return (
    <div
      style={{
        marginBottom: 12,
        display: 'flex',
        gap: 12,
        flexWrap: 'nowrap',
        alignItems: 'center',
      }}
    >
      <input
        type="search"
        placeholder="Search by name or batch ID..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
        style={{ flex: 1, minWidth: 0 }}
      />
    </div>
  );
}
