import { Injectable } from '@nestjs/common';
import {
  BlockfrostProvider,
  deserializeAddress,
  MeshWallet,
} from '@meshsdk/core';
import { Cip68Contract } from './cip68.contract';
import { BLOCKFROST_API_KEY, appNetworkId } from './constants';
import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';

@Injectable()
export class ContractService {
  private blockfrostProvider: BlockfrostProvider;

  constructor() {
    this.blockfrostProvider = new BlockfrostProvider(BLOCKFROST_API_KEY);
  }

  private createWalletFromAddress(walletAddress: string): MeshWallet {
    return new MeshWallet({
      networkId: appNetworkId,
      fetcher: this.blockfrostProvider,
      submitter: this.blockfrostProvider,
      key: {
        type: 'address',
        address: walletAddress,
      },
    });
  }

  getPolicyId(walletAddress: string) {
    const wallet = this.createWalletFromAddress(walletAddress);
    const contract = new Cip68Contract({ wallet });
    return {
      policyId: contract.policyId,
      storeAddress: contract.storeAddress,
    };
  }

  async createMint(walletAddress: string, params: MintDto[]) {
    try {
      const wallet = this.createWalletFromAddress(walletAddress);
      const contract = new Cip68Contract({ wallet });
      const pubKeyHash = deserializeAddress(walletAddress).pubKeyHash;

      const assets = params.map((p) => ({
        assetName: p.assetName,
        quantity: p.quantity || '1',
        receiver: p.receiver || walletAddress,
        metadata: {
          ...p.metadata,
          _pk: pubKeyHash,
        },
      }));

      const unsignedTx = await contract.mint(assets);
      return {
        result: true,
        data: unsignedTx,
        message: 'Transaction created successfully',
      };
    } catch (error) {
      return {
        result: false,
        data: null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async createBurn(walletAddress: string, params: BurnDto[]) {
    try {
      const wallet = this.createWalletFromAddress(walletAddress);
      const contract = new Cip68Contract({ wallet });

      const assets = params.map((p) => ({
        assetName: p.assetName,
        quantity: p.quantity || '-1',
      }));

      const unsignedTx = await contract.burn(assets);
      return {
        result: true,
        data: unsignedTx,
        message: 'Transaction created successfully',
      };
    } catch (error) {
      return {
        result: false,
        data: null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async createUpdate(walletAddress: string, params: UpdateMetadataDto[]) {
    try {
      const wallet = this.createWalletFromAddress(walletAddress);
      const contract = new Cip68Contract({ wallet });
      const pubKeyHash = deserializeAddress(walletAddress).pubKeyHash;

      const assets = params.map((p) => ({
        assetName: p.assetName,
        metadata: {
          ...p.metadata,
          _pk: pubKeyHash,
        },
      }));

      const unsignedTx = await contract.update(assets);
      return {
        result: true,
        data: unsignedTx,
        message: 'Transaction created successfully',
      };
    } catch (error) {
      return {
        result: false,
        data: null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async createPayment(walletAddress: string, amount: string) {
    try {
      const wallet = this.createWalletFromAddress(walletAddress);
      const contract = new Cip68Contract({ wallet });

      const unsignedTx = await contract.payment({ amount });
      return {
        result: true,
        data: unsignedTx,
        message: 'Transaction created successfully',
      };
    } catch (error) {
      return {
        result: false,
        data: null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
