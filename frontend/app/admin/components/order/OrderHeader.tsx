type Props = {
  styles: Record<string, string>;
};

export function OrderHeader({ styles }: Props) {
  return (
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>Orders</h1>
    </div>
  );
}
