type Props = {
  styles: Record<string, string>;
  onAdd: () => void;
};

export function CertHeader({ styles, onAdd }: Props) {
  return (
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>Certificates</h1>
      <button
        type="button"
        className={styles.addIcon}
        onClick={onAdd}
        aria-label="Add certificate"
        title="Add certificate"
      >
        +
      </button>
    </div>
  );
}
