import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { UploadApiResponse } from 'cloudinary';
import prisma from '../../../../../lib/prisma';
import { authOptions } from '../[...nextauth]/route';
import cloudinary from '../../../../../lib/cloudinary';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const avatarFile = formData.get('avatar') as File;

    //   handle the file upload claudinary

    //   convert array buffer to nodejs buffer
    const arrayBuffer = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    //   upload the file to cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'chatapp-avatars-vibes' }, (error, result) => {
          if (error || !result) {
            reject(error);
          } else {
            resolve(result);
          }
        })
        .end(buffer);
    });

    const avatar_url = uploadResult.secure_url;

    //   update the user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, bio, avatar: avatar_url, hasProfile: true },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error('profile-setup-error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
