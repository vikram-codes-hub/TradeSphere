/* ============================================================
   RESPONSE UTILS
   Consistent API response helpers
   ============================================================ */

export const successResponse = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

export const errorResponse = (res, message = "Something went wrong", statusCode = 500, data = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...data,
  });
};

export const paginatedResponse = (res, { data, total, page, limit }) => {
  return res.status(200).json({
    success: true,
    count:   data.length,
    total,
    page:    parseInt(page),
    pages:   Math.ceil(total / parseInt(limit)),
    data,
  });
};