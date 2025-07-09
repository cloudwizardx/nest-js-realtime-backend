import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SendMessageRequest {
    @IsString()
    @IsNotEmpty()
    receiverId: string

    @IsString()
    @IsNotEmpty()
    content: string


    @IsOptional()
    @IsArray()
    attachments?: {
        url: string
        fileName: string
        type: string
    }
}