import { connect } from "mongoose"
import { DB_URI } from "../config/config"




const connectDB = async ()=>{
    try{
        await connect(DB_URI,{serverSelectionTimeoutMS:30000});
        console.log(`DB connected Successfully 😍`);
        
    }catch(error: unknown){
        console.log(`fail to connect on DB ...❌❌❌ ${error}`);
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log(String(error));
        }
    }
}

export default connectDB