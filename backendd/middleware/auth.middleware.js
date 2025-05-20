const jwt = require('jsonwebtoken');

const authMiddleware = {
    verifyToken: (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Token invalide' });
        }
    },

    checkRole: (roles) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ message: 'Non authentifié' });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Accès interdit' });
            }

            next();
        };
    },

    filterDataByRole: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Non authentifié' });
        }

        // Filtrer les données en fonction du rôle
        if (req.user.role === 'superadmin1') {
            req.technoFilter = 'techno1';
        } else if (req.user.role === 'superadmin2') {
            req.technoFilter = 'techno2';
        } else if (req.user.role === 'globaladmin') {
            req.technoFilter = 'all';
        }

        next();
    }
};

module.exports = authMiddleware; 