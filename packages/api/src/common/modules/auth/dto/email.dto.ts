import { EmailScene, type EmailSceneType } from "@buildingai/constants/shared/email.constant";
import {
    UserTerminal,
    type UserTerminalType,
} from "@buildingai/constants/shared/status-codes.constant";
import { Type } from "class-transformer";
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
} from "class-validator";

/**
 * 发送邮件验证码 DTO
 */
export class SendEmailCodeDto {
    @IsNotEmpty({ message: "邮箱不能为空" })
    @IsEmail({}, { message: "邮箱格式不正确" })
    email: string;

    @IsOptional()
    @IsNumber()
    @IsEnum(EmailScene)
    scene: EmailSceneType = EmailScene.LOGIN;
}

/**
 * 邮箱验证码登录 DTO
 */
export class EmailLoginDto {
    @IsNotEmpty({ message: "邮箱不能为空" })
    @IsEmail({}, { message: "邮箱格式不正确" })
    email: string;

    @IsNotEmpty({ message: "验证码不能为空" })
    @IsString({ message: "验证码必须为字符串" })
    @Length(6, 6, { message: "验证码必须为6位" })
    code: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @IsEnum(UserTerminal)
    terminal: UserTerminalType;
}
