import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "node:http";

import { IAuthSocket } from "../../common/types/express.type";
import {
    redisService,
    RedisService,
    TokenService
} from "../../common/services";

export class RealTimeGateway {

    private io!: Server;
    private readonly tokenService: TokenService;
    private readonly redisService: RedisService;

    constructor() {
        this.tokenService = new TokenService();
        this.redisService = redisService;
    }

    /**
     * Socket Authentication Middleware
     */
    authentication = async (socket: IAuthSocket & Socket, next: any) => {
        try {

            const token =
                (socket.handshake.auth.authorization ||
                    socket.handshake.headers.authorization) as string;

            const { user, decoded } =
                await this.tokenService.decodeToken({
                    token,
                    tokenType: "ACCESS" as any,
                });

            socket.data = {
                user,
                decoded,
            };

            await this.redisService.addSocket(user._id, socket.id);

            next();

        } catch (error) {
            next(error);
        }
    };

    /**
     * Initialize Socket.IO
     */
    initializeIo = (httpServer: HttpServer) => {

        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
            },
        });

        // Authentication Middleware
        this.io.use(this.authentication);

        this.io.on("connection", (socket: IAuthSocket & Socket) => {

            console.log(`User Connected : ${socket.data.user._id}`);

            /**
             * Test Event
             */
            socket.on("sayHi", (data) => {
                console.log("sayHi:", data);
            });

            /**
             * Disconnect Event
             */
            socket.on("disconnect", async () => {

                console.log(`User Disconnected : ${socket.data.user._id}`);

                // Remove current socket
                await this.redisService.removeSocket(
                    socket.data.user._id,
                    socket.id
                );

                // Check remaining sockets
                const connections =
                    await this.redisService.getSockets(
                        socket.data.user._id
                    ) || [];

                // If user has no active sockets
                if (connections.length === 0) {
                    this.io.emit("offline_user", {
                        userId: socket.data.user._id,
                    });
                }
            });

        });
    };
}