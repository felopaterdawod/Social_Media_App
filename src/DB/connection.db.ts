import { connect } from "mongoose"
import { DB_URI } from "../config/config"



const connectDB = async ()=>{
    try{
        await connect(DB_URI,{serverSelectionTimeoutMS:30000});
        console.log(`DB connected Successfully 😍`);
        
    }catch(error){
        console.log(`fail to connect on DB ...❌❌❌ ${error}`);
    }
}

export default connectDB