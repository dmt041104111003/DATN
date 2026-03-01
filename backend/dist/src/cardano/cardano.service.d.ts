import { BlockfrostProvider } from "@meshsdk/core";
import { ConfigService } from "../config/config.service";
import { BlockfrostFetcher } from "./blockfrost.fetcher";
export declare class CardanoService {
    private readonly config;
    private _fetcher;
    private _provider;
    constructor(config: ConfigService);
    get blockfrostFetcher(): BlockfrostFetcher;
    get blockfrostProvider(): BlockfrostProvider;
}
