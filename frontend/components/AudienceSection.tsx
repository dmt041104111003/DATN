"use client";

import { User, Truck, Building2, Factory } from "lucide-react";
import { GovSectionHeader } from "./GovSectionHeader";

export function AudienceSection() {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="gov-section overflow-hidden">
          <GovSectionHeader index="04" title="Đối tượng sử dụng" />
          <div className="gov-section-body p-4 md:p-6 space-y-6 w-full">
            {[
              {
                icon: User,
                title: "Người tiêu dùng",
                text: "Quét mã QR trên bao bì (trang Quét truy xuất) để xem thông tin thùng hàng và lịch sử on-chain.",
              },
              {
                icon: Factory,
                title: "Doanh nghiệp sản xuất",
                text: "Quản lý vụ mùa, đóng thùng, kho hàng; nhập–xuất kho bằng QR; đăng ký hồ sơ và kho qua ví.",
              },
              {
                icon: Truck,
                title: "Đơn vị trung chuyển",
                text: "Hub kho trung chuyển: nhập–xuất thùng giữa các chặng, đồng bộ tồn kho và điều kiện bảo quản.",
              },
              {
                icon: Building2,
                title: "Đại lý phân phối",
                text: "Nhập kho tại điểm bán, tiêu thụ thùng (xuất + CONSUMED), tra cứu tồn theo mã thùng.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 border-b border-[#e8c4ca] pb-5 last:border-0">
                <item.icon className="w-8 h-8 text-[#c41e3a] flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-[#8f1529] mb-1">{item.title}</h3>
                  <p className="text-sm md:text-base text-gray-800 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
