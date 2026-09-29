import express from "express";
import dns from "node:dns";
import { Server } from "socket.io";

import bootstrap from "./app.bootstrap";
import { PORT } from "./config/config";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

bootstrap(app)
    .then(() => {

        // Local development only
        if (!process.env.VERCEL) {

            const httpServer = app.listen(PORT, () => {
                console.log(
                    `Server is running on port ${PORT}🚀🚀🚀`
                );
            });

            const io = new Server(httpServer, {
                cors: {
                    origin: "http://127.0.0.1:5500",
                    methods: ["GET", "POST"],
                    credentials: true
                }
            });

            io.on("connection", (socket) => {
                console.log(
                    "User Connected via Socket:",
                    socket.id
                );
            });
        }

    })
    .catch((error) => {
        console.error(
            "Application bootstrap failed:",
            error
        );
    });

export default app;