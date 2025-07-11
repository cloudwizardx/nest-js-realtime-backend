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

    @IsOptional()
    attachments?: {
        filename: string;
        type: string;
        base64: string;
    }[];

}

