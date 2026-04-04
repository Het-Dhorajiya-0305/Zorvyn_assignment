

const authorize = (...allowedRoles) => {

  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission",
      });
    }

    next();
  };
};

export default authorize;