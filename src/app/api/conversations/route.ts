import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Types } from 'mongoose';
import { Conversation, ConversationDocument, Message, User } from '../../../../lib/models';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';

const ONLINE_THRESHOLD_MS = 30 * 1000; // dianggap online kalau heartbeat terakhir < 30 detik lalu

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  lastActiveAt: Date | null;
}

type PopulatedConversation = Omit<ConversationDocument, 'participants'> & {
  _id: Types.ObjectId;
  participants: PopulatedUser[];
};

// GET: HANYA mengembalikan conversation yang participants-nya memuat user yang sedang login.
// Ini kunci dari fitur wajib #5: isolasi data ditegakkan di query, bukan disaring di frontend.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const conversations = (await Conversation.find({ participants: session.user.id })
    .populate('participants', 'name email lastActiveAt')
    .sort({ updatedAt: -1 })
    .lean()) as unknown as PopulatedConversation[];

  const now = Date.now();

  const result = await Promise.all(
    conversations.map(async (c) => {
      const other = c.participants.find((p) => p._id.toString() !== session.user.id);
      const myRead = c.reads?.find((r) => r.userId.toString() === session.user.id);
      const lastReadAt = myRead?.lastReadAt || new Date(0);

      // Hitung pesan dari lawan bicara yang lebih baru dari lastReadAt kita (bonus: penanda belum dibaca).
      const unreadCount = await Message.countDocuments({
        conversationId: c._id,
        senderId: { $ne: session.user.id },
        createdAt: { $gt: lastReadAt },
      });

      const isOnline = other?.lastActiveAt
        ? now - new Date(other.lastActiveAt).getTime() < ONLINE_THRESHOLD_MS
        : false;

      return {
        id: c._id.toString(),
        other: other
          ? { id: other._id.toString(), name: other.name, email: other.email, isOnline }
          : null,
        lastMessage: c.lastMessage?.text || '',
        lastMessageAt: c.lastMessage?.createdAt || c.updatedAt,
        unreadCount,
      };
    }),
  );

  return NextResponse.json(result);
}

// POST: mulai chat baru dengan user terdaftar lain. Kalau conversation sudah ada, pakai yang lama.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { otherUserId } = (await req.json()) as { otherUserId?: string };
  if (!otherUserId) {
    return NextResponse.json({ error: 'otherUserId wajib diisi' }, { status: 400 });
  }
  if (otherUserId === session.user.id) {
    return NextResponse.json(
      { error: 'Tidak bisa memulai chat dengan diri sendiri' },
      { status: 400 },
    );
  }

  await connectDB();

  // Pastikan target adalah user yang benar-benar terdaftar.
  const otherUser = await User.findById(otherUserId).select('name email lastActiveAt');
  if (!otherUser) {
    return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [session.user.id, otherUserId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [session.user.id, otherUserId],
    });
  }

  const isOnline = otherUser.lastActiveAt
    ? Date.now() - new Date(otherUser.lastActiveAt).getTime() < ONLINE_THRESHOLD_MS
    : false;

  return NextResponse.json({
    id: conversation._id.toString(),
    other: { id: otherUser._id.toString(), name: otherUser.name, email: otherUser.email, isOnline },
    lastMessage: conversation.lastMessage?.text || '',
    lastMessageAt: conversation.lastMessage?.createdAt || conversation.updatedAt,
    unreadCount: 0,
  });
}
