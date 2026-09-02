import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { supabase } from '../../config/supabase.js';

export const authService = {
  /**
   * Direct Login with Email and Password
   */
  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    // Sign internal JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },

  /**
   * Register a new user
   */
  async register(name, email, password, role = 'SALES') {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      const err = new Error('A user with this email already exists.');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },

  /**
   * Synchronize Supabase User with Prisma Database
   */
  async syncSupabaseUser(supabaseToken) {
    if (!supabase) {
      throw new Error('Supabase is not configured on the server.');
    }

    const { data, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !data?.user) {
      const err = new Error('Invalid Supabase access token.');
      err.statusCode = 401;
      throw err;
    }

    const sbUser = data.user;
    const email = sbUser.email?.toLowerCase();
    const name = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || email?.split('@')[0] || 'User';

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ supabaseUid: sbUser.id }, { email }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          supabaseUid: sbUser.id,
          email,
          name,
          role: 'SALES', // Default role
        },
      });
    } else if (!user.supabaseUid) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { supabaseUid: sbUser.id },
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        supabaseUid: user.supabaseUid,
      },
    };
  },

  /**
   * Get User by ID
   */
  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return user;
  },

  /**
   * List all users (Admin only)
   */
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Update User Role (Admin only)
   */
  async updateUserRole(id, newRole) {
    const validRoles = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];
    if (!validRoles.includes(newRole)) {
      const err = new Error(`Invalid role. Valid roles are: ${validRoles.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    return prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  },
};
