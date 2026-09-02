import { errorResponse } from '../utils/apiResponse.js';

/**
 * Role-based Authorization Guard Middleware
 * @param {string[]} allowedRoles
 */
export function hasRole(...allowedRoles) {
  return async function (request, reply) {
    if (!request.user) {
      return errorResponse(reply, 'Unauthorized. Please login first.', 401);
    }

    const userRole = request.user.role;

    // Admin has access to all resources
    if (userRole === 'ADMIN') {
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      return errorResponse(
        reply,
        `Forbidden: Access denied. Required role(s): [${allowedRoles.join(', ')}]. Your role: ${userRole}`,
        403
      );
    }
  };
}
