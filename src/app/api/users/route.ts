import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import { User } from '../../../../lib/models';

// GET: daftar semua user terdaftar KECUALI akun yang sedang login.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const users = await User.find({ _id: { $ne: session.user.id } })
    .select('name email')
    .sort({ name: 1 })
    .lean();

  return NextResponse.json(
    users.map((u) => ({ id: u._id.toString(), name: u.name, email: u.email })),
  );
}
