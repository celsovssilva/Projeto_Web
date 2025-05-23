import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const loginUser = async (req, res) => {
    const { email, password, type} = req.body;

    if (!email || !password || !type) {
        return res.status(400).json({ error: "E-mail, senha e type são obrigatórios" });
    }

    try {
        let user;
        let userType;

        if (type === "usuario") {
            user = await prisma.usuario.findUnique({ where: { email } });
            userType = "usuario";
        } else if (type === "admin") {
            user = await prisma.Admin.findUnique({ where: { email } });
            userType = "admin";
        } else {
            return res.status(400).json({ error: "Tipo inválido. Use 'usuario' ou 'admin'." });
        }

        if (!user) {
            return res.status(401).json({ error: "E-mail ou senha inválidos" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "E-mail ou senha inválidos" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, type: userType },
            process.env.JWT_SECRET,
            { expiresIn: "12h" }
        );

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            token,
            user: userWithoutPassword,
            type: userType
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};