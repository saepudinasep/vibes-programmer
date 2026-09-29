import mongoose, { type Model, type Types } from 'mongoose';

const { Schema, models, model } = mongoose;

export interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationDocument {
  participants: Types.ObjectId[];
  lastMessage: {
    text: string;
    senderId?: Types.ObjectId;
    createdAt?: Date;
  };
  reads: { userId: Types.ObjectId; lastReadAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageDocument {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    lastActiveAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const ConversationSchema = new Schema<ConversationDocument>(
  {
    // Selalu berisi tepat 2 user id (chat 1-on-1).
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: {
      text: { type: String, default: '' },
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date },
    },
    // Kapan terakhir tiap user membaca conversation ini, untuk hitung pesan belum dibaca.
    reads: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        lastReadAt: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true },
);

// Index untuk mempercepat query "conversation milik user ini".
ConversationSchema.index({ participants: 1 });

const MessageSchema = new Schema<MessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

export const User =
  (models.User as Model<UserDocument> | undefined) || model<UserDocument>('User', UserSchema);
export const Conversation =
  (models.Conversation as Model<ConversationDocument> | undefined) ||
  model<ConversationDocument>('Conversation', ConversationSchema);
export const Message =
  (models.Message as Model<MessageDocument> | undefined) ||
  model<MessageDocument>('Message', MessageSchema);
