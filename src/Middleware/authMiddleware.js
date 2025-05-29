// import jwt from 'jsonwebtoken';

// export function verificarJWT(req, res, next) {
//   const token = req.body.token || req.headers['authorization'];

//   if (!token) {
//     return res.status(401).json({ mensagem: 'Token ausente.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; 
//     next();
//   } catch (err) {
//     return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
//   }
// }

// export function verificarToken(req, res, next) {
//   const token = req.body.token || req.headers['authorization'];

//   if (!token || token !== "seu-token-valido") {
//     return res.status(401).json({ mensagem: 'Token inválido ou ausente.' });
//   }

//   next(); 
// }