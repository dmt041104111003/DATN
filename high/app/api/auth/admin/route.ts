import { NextRequest, NextResponse } from 'next/server';
import { setAdminCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin123';

    if (username !== adminUser || password !== adminPass) {
      return NextResponse.json(
        { error: 'Tài khoản admin không đúng' },
        { status: 401 }
      );
    }

    await setAdminCookie();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
