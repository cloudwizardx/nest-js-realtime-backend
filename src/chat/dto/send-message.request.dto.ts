import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SendMessageRequest {
    @IsString()
    @IsNotEmpty()
    receiverId: string

    @IsString()
    @IsNotEmpty()
    receiverRole: string

    @IsString()
    @IsNotEmpty()
    content: string

    @IsString()
    @IsOptional()
    tempId?: string
}