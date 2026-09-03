import express from 'express'
import { authRouter, postRouter, schema, userRouter } from './modules';
import { authentication, globalErrorHandler } from './middleware';
import { PORT } from './config/config';
import connectDB from './DB/connection.db';
import { notificationService, redisService, s3Service } from './common/services';
import cors from 'cors';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
import { successResponse } from './common/response';
import { storyRouter } from './modules/story';
import { createHandler } from 'graphql-http/lib/use/express';
import { Server } from 'socket.io';



const s3WriteStream = promisify(pipeline)

const bootstrap = async (): Promise<void> => {


    const app: express.Express = express();

    app.use(express.json());

    app.use(cors({
        origin: 'http://127.0.0.1:5500', // رابط الـ Live Server للفرونت إند الخاص بك
        credentials: true
    }));


    app.all('/graphql', authentication(), createHandler({ schema: schema, context: (req) => ({ user: req.raw.user, decoded: req.raw.decoded }) }))
    app.get('/', (req: express.Request, res: express.Response, next: express.NextFunction): express.Response => {

        return res.status(200).json({ message: "Landing Page" })
    })

    app.post('/send-notification', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
        console.log({ token: req.body.token });
        await notificationService.sendNotification({
            token: req.body.token,
            data: {
                title: "first time",
                body: 'hello world'
            }
        })

        return res.status(200).json({ message: "Landing Page" })
    })


    //application-routing
    app.use("/auth", authRouter)
    app.use("/user", userRouter)
    app.use("/post", postRouter)
    app.use("/story", storyRouter)


    app.get("/uploads/*path", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const { download, fileName } = req.query as { download: string, fileName: string };
        const { path } = req.params as { path: string[] };

        const Key = path.join("/");

        const { Body, ContentType } = await s3Service.getAsset({ Key });

        console.log({ Body, ContentType });

        res.setHeader(
            "Content-Type",
            ContentType || "application/octet-stream"
        );

        res.set("Cross-Origin-Resource-Policy", "cross-origin");

        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`);
        }

        return await s3WriteStream(Body as NodeJS.ReadableStream, res);
    });

    app.get("/pre-signed/*path", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const { download, fileName } = req.query as { download: string, fileName: string };
        const { path } = req.params as { path: string[] };

        const Key = path.join("/");

        const url = await s3Service.createPreSignedFetchLink({ Key, download, fileName })
        return successResponse({ res, data: { url } })


    });








    app.get('/*dummy', (req: express.Request, res: express.Response, next: express.NextFunction): express.Response => {
        return res.status(404).json({ message: "Invalid application routing" })
    })





    //application error handling

    app.use(globalErrorHandler)

    //DB
    await connectDB()
    await redisService.connect()



    const httpServer = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}🚀🚀🚀`);

    })

     

    const io = new Server(httpServer, {
        cors: {
            origin: "http://127.0.0.1:5500", // نفس رابط الفرونت إند
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("User Connected via Socket:", socket.id);
    })


}

export default bootstrap;