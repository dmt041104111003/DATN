import cbor from "cbor";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { deserializeDatum } from "@meshsdk/core";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertDatum(plutusData: string): Record<string, string> {
  const datum = deserializeDatum(plutusData);
  const metadata: Record<string, string> = {};
  try {
    const list = datum?.fields?.[0]?.list || datum?.fields?.[0];

    if (!Array.isArray(list)) {
      console.warn("Invalid CIP68 format: list not found");
      return metadata;
    }

    list.forEach((item: any) => {
      const fields = item?.fields || item;

      if (!Array.isArray(fields) || fields.length < 2) return;

      const keyHex = fields[0]?.bytes;
      const valueHex = fields[1]?.bytes;

      if (!keyHex || !valueHex) return;

      const key = Buffer.from(keyHex, "hex").toString("utf8");
      const value = Buffer.from(valueHex, "hex").toString("utf8");

      metadata[key] = value;
    });

    return metadata;
  } catch (error) {
    console.error("Error converting CIP68 to metadata:", error);
    return {};
  }
}

/**
 * @description Convert inline datum from utxo to metadata
 * 1. Converts a hex string into a buffer for decoding.
 * 2. Decodes CBOR data from the buffer to a JavaScript object.
 * 3. Outputs a JSON metadata ready for further use
 *
 * @param datum
 * @returns metadata
 */
export async function deserializeInlineDatum(datum: string): Promise<unknown> {
  const cborDatum: Buffer = Buffer.from(datum, "hex");
  const datumMap = (await cbor.decodeFirst(cborDatum)).value[0];
  if (!(datumMap instanceof Map)) {
    throw new Error("Invalid Datum");
  }
  const obj: Record<string, string> = {};
  datumMap.forEach((value, key) => {
    const keyStr = key.toString("utf-8");
    obj[keyStr] = value.toString("utf-8");
  });
  return obj;
}

export function convertToKeyValue(
  data: {
    k: { bytes: string };
    v: { bytes?: string; list?: { bytes: string }[] };
  }[],
): Record<string, string | string[]> {
  return Object.fromEntries(
    data.map(({ k, v }) => {
      const key = Buffer.from(k.bytes, "hex").toString("utf-8");
      let value: string | string[];

      if (key === "_pk") {
        value = v.bytes || "";
      } else if (v.list) {
        value = v.list
          .map((item) => {
            try {
              return Buffer.from(item.bytes, "hex").toString("utf-8");
            } catch (error) {
              console.error(
                `Lỗi giải mã bytes cho waypoint: ${item.bytes}`,
                error,
              );
              return "";
            }
          })
          .filter((item) => item !== "");
      } else if (v.bytes) {
        value = Buffer.from(v.bytes, "hex").toString("utf-8");
      } else {
        value = "";
      }

      return [key, value];
    }),
  );
}

export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);
