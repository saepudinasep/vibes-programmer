import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import { User } from '../../../../lib/models';

// Dipanggil berkala (heartbeat) dari client selama aplikasi terbuka.
// User dianggap "online" kalau lastActiveAt dalam ONLINE_THRESHOLD_MS terakhir (lihat app/api/conversations/route.js).
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, { lastActiveAt: new Date() });

  return NextResponse.json({ ok: true });
}
