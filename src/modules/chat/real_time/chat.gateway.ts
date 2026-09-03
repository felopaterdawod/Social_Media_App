import { Server, Socket } from "socket.io";
import { IAuthSocket } from "../../../common/types/express.type";
import { ChatEvent , chatEvent } from "./chat.event";


export class ChatGateway {
    private chatEvent:ChatEvent
    constructor() {
        this.chatEvent = chatEvent
     }

    registerEvents = (socket: IAuthSocket & Socket, io: Server) => { 
        this.chatEvent.sayHi(socket)
    }
}

export const chatGateway = new ChatGateway()