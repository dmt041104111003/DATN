"use client";

export function Footer() {
  return (
    <footer className="gov-footer w-full text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 text-sm">
            <p className="font-bold uppercase tracking-wider text-[#ffd89b]">Liên hệ</p>
            <p>Hà Nội, Việt Nam</p>
            <p>Hotline: (84) 24 xxxx xxxx</p>
            <p>contact@traceability.vn</p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-bold uppercase tracking-wider text-[#ffd89b]">Kết nối</p>
            <p>Mạng xã hội & hợp tác truyền thông</p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-bold uppercase tracking-wider text-[#ffd89b]">Ứng dụng</p>
            <p>Phiên bản mobile (sắp ra mắt)</p>
          </div>
        </div>
        <div className="border-t border-[#d4af37]/40 mt-8 pt-4 text-center text-xs text-white/80">
          © {new Date().getFullYear()} Truy xuất nguồn gốc nông sản — Cardano
        </div>
      </div>
    </footer>
  );
}
