const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
