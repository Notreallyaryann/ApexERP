/**
 * Standard API Response Formatters
 */

export function successResponse(reply, data = null, message = 'Success', statusCode = 200, pagination = null) {
  const response = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return reply.code(statusCode).send(response);
}

export function errorResponse(reply, message = 'An error occurred', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return reply.code(statusCode).send(response);
}
