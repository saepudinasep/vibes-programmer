import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Types } from 'mongoose';
import { authOptions } from '../../../../../../lib/auth';
import { connectDB } from '../../../../../../lib/mongodb';
import { Conversation } from '../../../../../../lib/models';

type RouteContext = { params: Promise<{ id: string }> };

// Dipanggil dari client saat user membuka sebuah percakapan, supaya
// penanda "belum dibaca" hilang untuk conversation itu.
export async function POST(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const conversation = await Conversation.findById(id);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation tidak ditemukan' }, { status: 404 });
  }
  const isParticipant = conversation.participants.some((p) => p.toString() === session.user.id);
  if (!isParticipant) {
    return NextResponse.json({ error: 'Conversation tidak ditemukan' }, { status: 404 });
  }

  const now = new Date();
  const existingRead = conversation.reads.find((r) => r.userId.toString() === session.user.id);
  if (existingRead) {
    existingRead.lastReadAt = now;
  } else {
    conversation.reads.push({ userId: new Types.ObjectId(session.user.id), lastReadAt: now });
  }
  await conversation.save();

  return NextResponse.json({ ok: true, lastReadAt: now });
}
