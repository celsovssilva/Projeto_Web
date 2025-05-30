import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    req.flash('error', 'Acesso não autorizado. Faça login.');
    if (req.accepts('html')) {
      return res.redirect('/api/login');
    }
    return res.status(401).json({ message: 'Token não fornecido ou sessão inválida. Acesso não autorizado.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      console.error('Erro na verificação do JWT:', err.message);
      if (req.session) {
        req.session.destroy();
      }
      req.flash('error', 'Sessão inválida ou expirada. Faça login novamente.');
      if (req.accepts('html')) {
        return res.redirect('/api/login');
      }
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado. Faça login novamente.' });
      }
      return res.status(403).json({ message: 'Token inválido.' });
    }
    req.user = decodedUser;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.type === 'admin') {
    next();
  } else {
    req.flash('error', 'Acesso negado. Somente administradores.');
    if (req.accepts('html')) {
      return res.redirect('/api/login');
    }
    return res.status(403).json({ message: 'Acesso negado. Somente administradores podem realizar esta ação.' });
  }
};