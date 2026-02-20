const normalizeRole = (role = "") =>
    String(role).trim().toLowerCase().replace(/[\s_]+/g, " ");

export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const normalizedUserRole = normalizeRole(req.user.role);
        const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));

        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions."
            });
        }

        next();
    };
};
