export function moveItem<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const out = [...arr];
  const [removed] = out.splice(fromIndex, 1);
  out.splice(toIndex, 0, removed);
  return out;
}
