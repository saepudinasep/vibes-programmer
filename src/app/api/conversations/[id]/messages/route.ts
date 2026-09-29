import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { HydratedDocument } from 'mongoose';
import { Conversation, ConversationDocument, Message } from '../../../../../../lib/models';
import { authOptions } from '../../../../../../lib/auth';
import { connectDB } from '../../../../../../lib/mongodb';

type RouteContext = { params: Promise<{ id: string }> };

// Helper: pastikan session.user adalah salah satu participant conversation ini.
// Dipanggil di GET dan POST supaya tidak ada celah akses lewat API meskipun tahu ID conversation orang lain.
async function assertParticipant(
  conversationId: string,
  userId: string,
): Promise<HydratedDocument<ConversationDocument> | null | false> {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return null;
  const isParticipant = conversation.participants.some((p) => p.toString() === userId);
  return isParticipant ? conversation : false;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const conversation = await assertParticipant(id, session.user.id);
  if (conversation === null) {
    return NextResponse.json({ error: 'Conversation tidak ditemukan' }, { status: 404 });
  }
  if (conversation === false) {
    // Sengaja pakai 404, bukan 403, supaya tidak membocorkan bahwa ID tersebut valid milik orang lain.
    return NextResponse.json({ error: 'Conversation tidak ditemukan' }, { status: 404 });
  }

  const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 }).lean();

  return NextResponse.json(
    messages.map((m) => ({
      id: m._id.toString(),
      senderId: m.senderId.toString(),
      text: m.text,
      createdAt: m.createdAt,
    })),
  );
}

export async function POST(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { text } = (await req.json()) as { text?: string };
  if (!text?.trim()) {
    return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
  }

  await connectDB();
  const conversation = await assertParticipant(id, session.user.id);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation tidak ditemukan' }, { status: 404 });
  }

  const message = await Message.create({
    conversationId: id,
    senderId: session.user.id,
    text: text.trim(),
  });

  conversation.lastMessage = {
    text: message.text,
    senderId: message.senderId,
    createdAt: message.createdAt,
  };
  await conversation.save();

  return NextResponse.json({
    id: message._id.toString(),
    senderId: session.user.id,
    text: message.text,
    createdAt: message.createdAt,
  });
}
