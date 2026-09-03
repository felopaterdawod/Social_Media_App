import type { Socket } from "socket.io";
import { IAuthSocket } from "../../../common/types/express.type";
import { ChatService, chatService } from "../chat.service";
import { SocketValidation } from "../../../middleware";

import * as validators from '../chat.validation'

export class ChatEvent {
    private chatService: ChatService;
    constructor() {
        this.chatService = chatService
    }

    sayHi = (socket: IAuthSocket & Socket) => {
        return socket.on("sayHi", async(data: { name: string }) => {
            try {
                await SocketValidation<{ name: string }>(validators.sayHi, data)
                console.log({ data });
                const result = this.chatService.sayHi()
                socket.emit("sayHi", result)



            } catch (error) {
                socket.emit("Custom_Error", error)

            }
        })
    }
}
export const chatEvent = new ChatEvent()