import { IsNotEmpty } from "class-validator";


export class GetMessagesRequest {
    @IsNotEmpty()
    conversationId: string

    page: number

    limit: number
}