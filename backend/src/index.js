import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser"; // Est un middleware Express.js qui permet de lire et de récupérer les cookies envoyés par le navigateur du client dans une requête HTTP
import cors from "cors";
import messageRoutes from "./routes/message.route.js";

import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const PORT = process.env.PORT || 5001;
// __dirname n'existe pas en ESM. path.resolve() renvoie le CWD (dossier de lancement),
// pas le dossier du fichier : le chemin du build changeait donc selon la commande start.
const __dirname = path.dirname(fileURLToPath(import.meta.url)); // -> backend/src

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Chemin absolu calcule a partir du fichier, pas du CWD
const frontendDist = path.join(__dirname, "../../frontend/dist");
const indexHtml = path.join(frontendDist, "index.html");

if (fs.existsSync(indexHtml)) {
    app.use(express.static(frontendDist));

    // SPA fallback : toute route non-API renvoie index.html
    // (syntaxe wildcard Express 5 : "/{*splat}")
    app.get("/{*splat}", (req, res) => {
        res.sendFile(indexHtml, (err) => {
            if (err) {
                console.error("sendFile error:", err.message);
                if (!res.headersSent) res.status(500).send("Erreur serveur");
            }
        });
    });
} else {
    // Pas de build frontend : utile en dev, et message clair en prod
    app.get("/", (req, res) => {
        res.send("Backend is running!");
    });
    console.warn(
        `[frontend] Build introuvable: ${indexHtml}. Lance "npm run build" a la racine.`
    );
}

server.listen(PORT, () => {
    console.log("server is running on PORT: " + PORT);
    connectDB();
});