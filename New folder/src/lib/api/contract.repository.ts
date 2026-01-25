import { httpClient } from "./client";
import type { MintAsset, BurnAsset } from "@/types";

interface ContractResponse<T = string | null> {
  result: boolean;
  data: T;
  message: string;
}

interface AddAgentTxData {
  unsignedTx: string;
  agentPubKeyHash: string;
}

export const contractRepository = {
  getInfo: (walletAddress: string): Promise<{ policyId: string; storeAddress: string }> =>
    httpClient.get(`/contract/info?walletAddress=${walletAddress}`),

  initializeRegistry: (
    walletAddress: string,
    initialAgents: string[] = []
  ): Promise<ContractResponse<string | null>> =>
    httpClient.post("/contract/registry/initialize", { walletAddress, initialAgents }),

  addAgentToRegistry: (
    walletAddress: string,
    agentAddress: string
  ): Promise<ContractResponse<AddAgentTxData | null>> =>
    httpClient.post("/contract/registry/add-agent", { walletAddress, agentAddress }),

  removeAgentFromRegistry: (
    walletAddress: string,
    agentAddress: string
  ): Promise<ContractResponse<{ unsignedTx: string; agentPubKeyHash: string } | null>> =>
    httpClient.post("/contract/registry/remove-agent", { walletAddress, agentAddress }),

  createBatchMint: (
    walletAddress: string,
    params: {
      assetName: string;
      quantity: string;
      roadmapAgentAddresses: string[];
      originGps?: string;
      unit?: string;
      productId?: string;
      batchInfo: {
        id: string;
        name: string;
        description?: string;
        imageUrl?: string;
        productionDate?: string;
        expiryDate?: string;
      };
    }
  ): Promise<ContractResponse<{ unsignedTx: string; policyId: string; assetName: string } | null>> =>
    httpClient.post("/contract/batch/mint", { walletAddress, ...params }),

  agentConfirm: (
    walletAddress: string,
    params: {
      assetName: string;
      currentStep: number;
      issuer: string;
      metadata: Record<string, string>;
      confirmGps?: string;
    }
  ): Promise<ContractResponse<{ unsignedTx: string } | null>> =>
    httpClient.post("/contract/batch/agent-confirm", { walletAddress, ...params }),

  agentConfirmShipment: (
    walletAddress: string,
    params: {
      assetName: string;
      receiverAddress: string;
      quantity: string;
      issuer: string;
      currentStep: number;
      metadata: Record<string, string>;
      confirmGps?: string;
    }
  ): Promise<ContractResponse<{ unsignedTx: string } | null>> =>
    httpClient.post("/contract/batch/agent-confirm-shipment", { walletAddress, ...params }),

  shipBatch: (
    walletAddress: string,
    params: {
      assetName: string;
      receiverAgent: string;
      destination: string;
      quantity: string;
      senderGps?: string;
    }
  ): Promise<ContractResponse<{ unsignedTx: string } | null>> =>
    httpClient.post("/contract/batch/ship", { walletAddress, ...params }),

  createMint: (
    walletAddress: string,
    assets: MintAsset[]
  ): Promise<ContractResponse<null>> =>
    httpClient.post("/contract/mint", { walletAddress, assets }),

  createBurn: (
    walletAddress: string,
    assets: BurnAsset[]
  ): Promise<ContractResponse<string | null>> =>
    httpClient.post("/contract/burn", { walletAddress, assets }),

  createUpdate: (
    walletAddress: string,
    assets: { assetName: string; metadata: Record<string, unknown> }[]
  ): Promise<ContractResponse<string | null>> =>
    httpClient.post("/contract/update", { walletAddress, assets }),

  confirmShipment: (
    walletAddress: string,
    params: {
      shipmentAddress: string;
      shipmentUtxoHash: string;
      shipmentUtxoIndex: number;
      policyId: string;
      assetName: string;
      quantity: string;
    }
  ): Promise<ContractResponse<{ unsignedTx: string } | null>> =>
    httpClient.post("/contract/shipment/confirm", { walletAddress, ...params }),

  cancelShipment: (
    walletAddress: string,
    params: {
      shipmentAddress: string;
      shipmentUtxoHash: string;
      shipmentUtxoIndex: number;
      policyId: string;
      assetName: string;
    }
  ): Promise<ContractResponse<{ unsignedTx: string } | null>> =>
    httpClient.post("/contract/shipment/cancel", { walletAddress, ...params }),

  submitTx: (signedTx: string): Promise<ContractResponse<string | null>> =>
    httpClient.post("/contract/submit", { signedTx }),
};
