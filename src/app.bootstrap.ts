
import express from 'express'
import { authRouter, userRouter } from './modules';
import { globalErrorHandler } from './middleware';
import { PORT } from './config/config';
import connectDB from './DB/connection.db';
import { redisService } from './common/services';
import cors from 'cors';





const bootstrap = async():Promise<void> => {


    const app: express.Express  = express();

    app.use(express.json(), cors());


    app.get('/',(req: express.Request , res: express.Response , next:express.NextFunction): express.Response =>{
         return res.status(200).json({message: "Landing Page"})
    })

    //application-routing
    app.use("/auth" , authRouter)
    app.use("/user" , userRouter)


    app.get('/*dummy',(req: express.Request , res: express.Response , next:express.NextFunction): express.Response =>{
       return res.status(404).json({message: "Invalid application routing"})
    })



    //application error handling

    app.use(globalErrorHandler)

    //DB
    await connectDB()
    await redisService.connect()



    app.listen(PORT , ()=>{
        console.log(`Server is running on port ${PORT}🚀🚀🚀`);
        
    })
    
    
}

export default bootstrap;