"use client";

import Image from "next/image";
import { GovSectionHeader } from "./GovSectionHeader";

export function AboutSection() {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="gov-section overflow-hidden">
          <GovSectionHeader index="02" title="Giới thiệu hệ thống" />
          <div className="gov-section-body w-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-[4fr_3fr] gap-8 items-center">
            <div className="relative w-full min-h-[320px] md:min-h-[420px]">
              <Image src="/b.png" alt="Giới thiệu" fill className="object-contain" priority />
            </div>
            <div className="space-y-3 text-sm md:text-base text-gray-800 leading-relaxed text-justify">
              <p>
                Hệ thống hỗ trợ truy xuất nguồn gốc nông sản trên chuỗi khối Cardano: ghi nhận vụ mùa, thùng hàng,
                nhập–xuất kho và tiêu thụ; mỗi thao tác quan trọng được xác thực bằng ví CIP-30 và lưu metadata
                on-chain để tra cứu công khai qua mã QR.
              </p>
              <p>
                Doanh nghiệp sản xuất đóng thùng và quản lý kho; đơn vị trung chuyển luân chuyển hàng giữa các
                kho; đại lý nhập kho và tiêu thụ tại điểm bán. Cả ba vai trò dùng chung mô hình kho (tên, địa điểm,
                sức chứa) và cập nhật điều kiện bảo quản theo từng thùng khi cần.
              </p>
              <p>
                Người tiêu dùng không cần đăng nhập: quét QR trên bao bì để xem lịch sử sản xuất, lưu kho và luân
                chuyển được đồng bộ từ cơ sở dữ liệu và Blockfrost — minh bạch, khó sửa đổi sau khi đã ghi nhận.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
