type Props = {
  styles: Record<string, string>;
  onAdd: () => void;
};

export function ProductsHeader({ styles, onAdd }: Props) {
  return (
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>Products</h1>
      <button
        type="button"
        className={styles.addIcon}
        onClick={onAdd}
        aria-label="Add product"
        title="Add product"
      >
        +
      </button>
    </div>
  );
}

