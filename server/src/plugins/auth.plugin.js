import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';
import prisma from '../config/prisma.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Authentication Hook for Fastify routes
 * Validates Supabase JWT or fallback internal JWT, and attaches request.user
 */
export async function authenticate(request, reply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(reply, 'Authentication required. Missing or malformed Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];

    let userEmail = null;
    let supabaseUid = null;
    let localUserId = null;

    // 1. Try Supabase Auth verification if configured
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          userEmail = data.user.email;
          supabaseUid = data.user.id;
        }
      } catch (err) {
        // Continue to fallback JWT verification
      }
    }

    // 2. If Supabase did not decode, attempt local JWT decode
    if (!userEmail) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        localUserId = decoded.id || decoded.userId;
        userEmail = decoded.email;
      } catch (jwtErr) {
        return errorResponse(reply, 'Invalid or expired authentication token.', 401);
      }
    }

    // 3. Find User in DB
    let user = null;
    if (localUserId) {
      user = await prisma.user.findUnique({ where: { id: localUserId } });
    } else if (userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    // If user authenticated via Supabase but doesn't exist in Prisma yet, auto-provision
    if (!user && userEmail) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          supabaseUid: supabaseUid,
          name: userEmail.split('@')[0],
          role: 'SALES', // default role
        },
      });
    }

    if (!user) {
      return errorResponse(reply, 'User account not found or deactivated.', 401);
    }

    // Attach user to request
    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      supabaseUid: user.supabaseUid,
    };
  } catch (err) {
    console.error('Auth verification error:', err);
    return errorResponse(reply, 'Authentication failed.', 401);
  }
}
