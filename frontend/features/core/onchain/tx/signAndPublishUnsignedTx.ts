import {
  publishAttestedRecord,
  signOutgoingAttestation,
} from "@/lib/wallet";

export async function signAndPublishUnsignedTx(unsignedCbor: string) {
  const signed = await signOutgoingAttestation(unsignedCbor);
  return publishAttestedRecord(signed);
}
