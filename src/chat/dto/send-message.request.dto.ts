import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Attachment } from '../chat.schema';
import { Type } from "class-transformer";

export class SendMessageRequest {
    @IsString()
    @IsNotEmpty()
    receiverId: string

    @IsString()
    @IsNotEmpty()
    content: string


    @IsOptional()
    @IsArray()
    @Type(() => Attachment)
    attachments?: Attachment[] 
}