"use client";

import { User, Truck, Building2 } from "lucide-react";
import { GovSectionHeader } from "./GovSectionHeader";

export function AudienceSection() {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="gov-section overflow-hidden">
          <GovSectionHeader index="04" title="Đối tượng sử dụng" />
          <div className="gov-section-body p-4 md:p-6 space-y-6 w-full">
            {[
              { icon: User, title: "Người tiêu dùng", text: "Quét QR để biết xuất xứ, chất lượng và lịch sử luân chuyển sản phẩm." },
              { icon: Truck, title: "Nhà phân phối / Đại lý", text: "Tối ưu tồn kho, đảm bảo toàn vẹn hàng hóa trong phân phối." },
              { icon: Building2, title: "Doanh nghiệp", text: "Minh bạch thương hiệu, đáp ứng chuẩn thương mại và kiểm toán." },
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
