function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

export function extractSignerPayload(
  data: unknown,
  extra?: Record<string, unknown>,
): Record<string, unknown> | null {
  const row = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const signerWallet = cleanString(row.signerWallet || row.signer_wallet);
  const signerLocationLabel = cleanString(row.signerLocationLabel || row.signer_location_label);
  const signerRole = cleanString(row.signerRole || row.signer_role);
  const signerDisplayName = cleanString(row.signerDisplayName || row.signer_display_name);
  const hasSigner = Boolean(signerWallet || signerLocationLabel || signerRole || signerDisplayName);
  if (!hasSigner && !extra) return null;
  return {
    signerWallet,
    signerLocationLabel,
    signerRole,
    signerDisplayName,
    ...(extra || {}),
  };
}
