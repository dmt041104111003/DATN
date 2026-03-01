type Props = {
  styles: Record<string, string>;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function WarehouseHeader({ styles, onRefresh, refreshing }: Props) {
  return (
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>My Warehouse</h1>
      {onRefresh && (
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh"
          title="Refresh list"
        >
          {refreshing ? 'Loading...' : 'Refresh'}
        </button>
      )}
    </div>
  );
}
