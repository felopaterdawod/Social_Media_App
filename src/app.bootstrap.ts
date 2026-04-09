
import express from 'express'
import { authRouter } from './modules';
import { globalErrorHandler } from './middleware';
import { PORT } from './config/config';
import connectDB from './DB/connection.db';





const bootstrap = async():Promise<void> => {
    const app: express.Express  = express();

    app.get('/',(req: express.Request , res: express.Response , next:express.NextFunction): express.Response =>{
         return res.status(200).json({message: "Landing Page"})
    })

    //application-routing
    app.use("/auth" , authRouter)


    app.get('/*dummy',(req: express.Request , res: express.Response , next:express.NextFunction): express.Response =>{
       return res.status(404).json({message: "Invalid application routing"})
    })



    //application error handling

    app.use(globalErrorHandler)

    //DB
    await connectDB()



    app.listen(PORT , ()=>{
        console.log(`Server is running on port ${PORT}🚀🚀🚀`);
        
    })
    
    
}

export default bootstrap;