export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export const SHIPMENT_SCAN_TITLE = "Quét QR lô hàng";

export const SCAN_STATUS = {
  processing: "Đang xử lý on-chain...",
  success: "Quét thành công: đã cập nhật trạng thái + vị trí on-chain.",
  failed: "Quét thất bại.",
} as const;

export const SCAN_ERROR = {
  noSession: "Không lấy được thông tin phiên đăng nhập.",
  noWallet: "Không tìm thấy địa chỉ ví hiện tại.",
  noProfileLocation: "Thiếu location trên hồ sơ. Vui lòng cập nhật hồ sơ trước.",
  saveTx: "Không tạo được giao dịch update on-chain.",
  patch: "Cập nhật shipment thất bại.",
} as const;

