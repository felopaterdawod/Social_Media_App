import { Model } from "mongoose";
import { IUser } from "../../common/interfaces"
import { loginDto, signupDto } from "./auth.dto"
import { ISignupResponse } from "./auth.entity"
import { UserModel } from "../../DB/model/user.model";


export class AuthenticationService {
    private userModel : Model<IUser>;
    constructor(){
        this.userModel = UserModel
     }

    public login = (data: loginDto): loginDto =>{

    return data
}


   public  async signup (data: signupDto): Promise<any> {

     const result = await this.userModel.create(data)

    return result

   }

}

export default new AuthenticationService()