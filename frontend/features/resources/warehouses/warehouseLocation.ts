import { cleanString } from "@/features/core/metadata/share/cleanString";
import {
  findMatchedOption,
  getDistrictOptions,
  getProvinceOptions,
  getWardOptions,
  type Option,
} from "@/features/resources/shared/location";

const emptyIds = () => ({
  warehouseProvinceId: "",
  warehouseDistrictId: "",
  warehouseWardId: "",
});

function findOptionById(options: Option[], id: string) {
  return options.find((row) => String(row.id) === String(id)) ?? null;
}

export async function buildWarehouseLocation(data: Record<string, unknown>) {
  const provinceId = cleanString(data?.warehouseProvinceId);
  const districtId = cleanString(data?.warehouseDistrictId);
  const wardId = cleanString(data?.warehouseWardId);

  if (!provinceId) throw new Error("Tỉnh/Thành kho là bắt buộc.");
  if (!districtId) throw new Error("Quận/Huyện kho là bắt buộc.");
  if (!wardId) throw new Error("Phường/Xã kho là bắt buộc.");

  const province = findOptionById(await getProvinceOptions(), provinceId);
  if (!province) throw new Error("Tỉnh/Thành kho không hợp lệ.");

  const district = findOptionById(await getDistrictOptions(provinceId), districtId);
  if (!district) throw new Error("Quận/Huyện kho không hợp lệ.");

  const ward = findOptionById(await getWardOptions(districtId), wardId);
  if (!ward) throw new Error("Phường/Xã kho không hợp lệ.");

  return `${ward.name}, ${district.name}, ${province.name}`;
}

/** DB lưu tên "Phường, Quận, Tỉnh" hoặc legacy mã số — map lại id cho SelectInput. */
export async function resolveWarehouseLocationIds(location: string) {
  const parts = cleanString(location)
    .split(",")
    .map((x) => cleanString(x))
    .filter(Boolean);

  if (parts.length < 3) return emptyIds();

  if (parts.every((p) => /^\d+$/.test(p))) {
    return {
      warehouseProvinceId: parts[0],
      warehouseDistrictId: parts[1],
      warehouseWardId: parts[2],
    };
  }

  // Lưu theo thứ tự: Phường/Xã, Quận/Huyện, Tỉnh/Thành
  const wardName = parts[0];
  const districtName = parts[1];
  const provinceName = parts[2];

  const provinces = await getProvinceOptions();
  const province = findMatchedOption(provinces, provinceName);
  if (!province) return emptyIds();

  const districts = await getDistrictOptions(province.id);
  const district = findMatchedOption(districts, districtName);
  if (!district) {
    return { warehouseProvinceId: province.id, warehouseDistrictId: "", warehouseWardId: "" };
  }

  const wards = await getWardOptions(district.id);
  const ward = findMatchedOption(wards, wardName);

  return {
    warehouseProvinceId: province.id,
    warehouseDistrictId: district.id,
    warehouseWardId: ward?.id ?? "",
  };
}

export function stripWarehouseAreaFields<T extends Record<string, unknown>>(data: T) {
  return {
    ...data,
    warehouseProvinceId: undefined,
    warehouseDistrictId: undefined,
    warehouseWardId: undefined,
  };
}
