import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email ?? '').toLowerCase().trim();
    const password = body.password ?? '';

    // perform server validation
    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'Email dan Password harus diisi!',
        },
        {
          status: 400,
        },
      );
    }

    // validate the email
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        {
          error: 'Tolong gunakan email valid',
        },
        {
          status: 400,
        },
      );
    }

    // validate the password
    if (password.length < 8) {
      return NextResponse.json(
        {
          error: 'Password harus memiliki panjang minimal 8 karakter!',
        },
        {
          status: 400,
        },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User dengan email tersebut sudah terdaftar!',
        },
        {
          status: 409,
        },
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    //   create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        name: '',
        avatar: '',
        bio: '',
        hasProfile: false,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.log('registrasi gagal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
