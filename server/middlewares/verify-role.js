module.exports = (allowedRole) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak",
            });
        }

        if (!allowedRole.includes(req.user.role)) {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak",
            });
        }

        next();
    };
};