import { BLOCKFROST_API_KEY } from "../../constants";
import { BlockfrostFetcher } from "./blockfrost";
import { BlockfrostProvider } from "@meshsdk/core";

const blockfrostFetcherSingleton = () => {
    return new BlockfrostFetcher(BLOCKFROST_API_KEY);
};
const blockfrostProviderSingleton = () => {
    return new BlockfrostProvider(BLOCKFROST_API_KEY);
};

declare const globalThis: {
    blockfrostFetcherGlobal: ReturnType<typeof blockfrostFetcherSingleton>;
    blockfrostProviderGlobal: ReturnType<typeof blockfrostProviderSingleton>;
} & typeof global;

const blockfrostFetcher = globalThis.blockfrostFetcherGlobal ?? blockfrostFetcherSingleton();
const blockfrostProvider = globalThis.blockfrostProviderGlobal ?? blockfrostProviderSingleton();

if (process.env.NODE_ENV !== "production") {
    globalThis.blockfrostFetcherGlobal = blockfrostFetcher;
    globalThis.blockfrostProviderGlobal = blockfrostProvider;
}

export { blockfrostFetcher, blockfrostProvider };
