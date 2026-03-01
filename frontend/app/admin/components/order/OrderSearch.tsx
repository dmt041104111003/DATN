type Props = {
  styles: Record<string, string>;
  query: string;
  onChange: (next: string) => void;
};

export function OrderSearch({ styles, query, onChange }: Props) {
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
        placeholder="Search by batch ID, recipient..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
        style={{ flex: 1, minWidth: 0 }}
      />
    </div>
  );
}
