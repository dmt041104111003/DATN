// import cbor from "cbor";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// import axios from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// export async function deserializeDatum(datum: string): Promise<unknown> {
//   const cborDatum: Buffer = Buffer.from(datum, "hex");
//   const datumMap = (await cbor.decodeFirst(cborDatum)).value[0];
//   if (!(datumMap instanceof Map)) {
//     throw new Error("Invalid Datum");
//   }
//   const obj: Record<string, string> = {};
//   datumMap.forEach((value, key) => {
//     const keyStr = key.toString("utf-8");
//     obj[keyStr] = value.toString("utf-8");
//   });
//   return obj;
// }

// export function convertToKeyValue(
//   data: {
//     k: { bytes: string };
//     v: { bytes?: string; list?: { bytes: string }[] };
//   }[],
// ): Record<string, string | string[]> {
//   return Object.fromEntries(
//     data.map(({ k, v }) => {
//       const key = Buffer.from(k.bytes, "hex").toString("utf-8");
//       let value: string | string[];

//       if (key === "_pk") {
//         value = v.bytes || "";
//       } else if (v.list) {
//         value = v.list
//           .map((item) => {
//             try {
//               return Buffer.from(item.bytes, "hex").toString("utf-8");
//             } catch (error) {
//               console.error(
//                 `Lỗi giải mã bytes cho waypoint: ${item.bytes}`,
//                 error,
//               );
//               return "";
//             }
//           })
//           .filter((item) => item !== "");
//       } else if (v.bytes) {
//         value = Buffer.from(v.bytes, "hex").toString("utf-8");
//       } else {
//         value = "";
//       }

//       return [key, value];
//     }),
//   );
// }


// export const api = axios.create({
//   baseURL: '/api', 
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('Axios error:', error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );


