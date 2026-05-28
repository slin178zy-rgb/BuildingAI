import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * 更新邮件 SMTP 配置 DTO
 */
export class UpdateEmailConfigDto {
    /** SMTP主机 */
    @IsNotEmpty({ message: "SMTP主机不能为空" })
    @IsString({ message: "SMTP主机必须为字符串" })
    @MaxLength(256, { message: "SMTP主机长度不能超过256" })
    host: string;

    /** SMTP端口 */
    @IsNotEmpty({ message: "SMTP端口不能为空" })
    @IsNumber({}, { message: "SMTP端口必须为数字" })
    port: number;

    /** 是否启用SSL/TLS */
    @IsOptional()
    @IsBoolean({ message: "secure必须为布尔值" })
    secure?: boolean;

    /** 是否强制AUTH LOGIN */
    @IsOptional()
    @IsBoolean({ message: "authLogin必须为布尔值" })
    authLogin?: boolean;

    /** 用户名 */
    @IsNotEmpty({ message: "用户名不能为空" })
    @IsString({ message: "用户名必须为字符串" })
    @MaxLength(256, { message: "用户名长度不能超过256" })
    username: string;

    /** 发件地址 */
    @IsNotEmpty({ message: "发件地址不能为空" })
    @IsEmail({}, { message: "发件地址格式不正确" })
    @MaxLength(256, { message: "发件地址长度不能超过256" })
    from: string;

    /** 密码/访问令牌 */
    @IsNotEmpty({ message: "密码/访问令牌不能为空" })
    @IsString({ message: "密码/访问令牌必须为字符串" })
    @MaxLength(512, { message: "密码/访问令牌长度不能超过512" })
    password: string;
}

/**
 * 邮件渠道启用状态 DTO
 */
export class UpdateEmailConfigStatusDto {
    /** 是否启用 */
    @IsOptional()
    @IsBoolean({ message: "enable必须为布尔值" })
    enable?: boolean;
}

/**
 * 发送测试邮件 DTO
 */
export class SendTestEmailDto {
    /** 收件人邮箱 */
    @IsNotEmpty({ message: "收件人邮箱不能为空" })
    @IsEmail({}, { message: "收件人邮箱格式不正确" })
    to: string;
}
