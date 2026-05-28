import crypto from "node:crypto";

import { RedisService } from "@buildingai/cache";
import { EmailScene, type EmailSceneType } from "@buildingai/constants/shared/email.constant";
import { InjectRepository } from "@buildingai/db/@nestjs/typeorm";
import { EmailConfig } from "@buildingai/db/entities/email-config.entity";
import { Repository } from "@buildingai/db/typeorm";
import { HttpErrorFactory } from "@buildingai/errors";
import { Injectable, Logger } from "@nestjs/common";
import { createTransport, type Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export interface EmailSendResult {
    success: boolean;
    message?: string;
}

@Injectable()
export class EmailService {
    private readonly CACHE_PREFIX = "email";
    private readonly CODE_PREFIX_TIME = 5 * 60;
    private readonly CODE_RESEND_LIMIT = 60;
    private readonly CODE_LENGTH = 6;

    private readonly logger = new Logger(EmailService.name);

    constructor(
        private readonly redisService: RedisService,
        @InjectRepository(EmailConfig)
        private readonly emailConfigRepository: Repository<EmailConfig>,
    ) {}

    private generateCode(length: number) {
        let result = "";
        for (let i = 0; i < length; i++) {
            result += crypto.randomInt(0, 10);
        }
        return result;
    }

    private getCacheKey(email: string, scene: EmailSceneType) {
        return `${this.CACHE_PREFIX}:${scene}:${email}`;
    }

    private getRateLimitKey(email: string, scene: EmailSceneType) {
        const today = new Date().toISOString().split("T")[0];
        return `${this.CACHE_PREFIX}:limit:${email}:${scene}:${today}`;
    }

    private async checkRateLimit(email: string, scene: EmailSceneType) {
        const key = this.getRateLimitKey(email, scene);
        const count = await this.redisService.incr(key);

        if (count === 1) {
            await this.redisService.expire(key, this.CODE_PREFIX_TIME);
        }

        const limit = 10;
        if (count > limit) {
            throw HttpErrorFactory.tooManyRequests();
        }
    }

    /**
     * 创建 SMTP 传输器
     */
    private async createTransporter(): Promise<Transporter<SMTPTransport.SentMessageInfo>> {
        const config = await this.emailConfigRepository.findOne({
            where: { enable: true },
            order: { sort: "ASC", createdAt: "ASC" },
        });

        if (!config || !config.smtpConfig) {
            throw HttpErrorFactory.badRequest("未启用邮件服务，请先在控制台配置");
        }

        const smtp = config.smtpConfig;

        const transportOptions: SMTPTransport.Options = {
            host: smtp.host,
            port: smtp.port,
            secure: smtp.secure,
            auth: {
                user: smtp.username,
                pass: smtp.password,
            },
        };

        if (smtp.authLogin) {
            transportOptions.authMethod = "LOGIN";
        }

        return createTransport(transportOptions);
    }

    /**
     * 发送邮件验证码
     */
    async sendCode(email: string, scene: EmailSceneType = EmailScene.LOGIN): Promise<EmailSendResult> {
        try {
            await this.checkRateLimit(email, scene);
            const key = this.getCacheKey(email, scene);
            const ttl = await this.redisService.ttl(key);

            const threshold = this.CODE_PREFIX_TIME - this.CODE_RESEND_LIMIT;
            if (ttl > threshold) {
                throw HttpErrorFactory.tooManyRequests(`Please try again after ${ttl} seconds`);
            }

            const code = this.generateCode(this.CODE_LENGTH);

            const transporter = await this.createTransporter();
            const config = await this.emailConfigRepository.findOne({
                where: { enable: true },
                order: { sort: "ASC", createdAt: "ASC" },
            });

            const from = config?.smtpConfig?.from || config?.smtpConfig?.username || "";

            let subject = "验证码";
            let content = "";

            switch (scene) {
                case EmailScene.LOGIN:
                    subject = "登录验证码";
                    content = `您正在登录，验证码为 <strong>${code}</strong>，请勿泄露给他人，5分钟内有效。`;
                    break;
                case EmailScene.REGISTER:
                    subject = "注册验证码";
                    content = `您正在注册账号，验证码为 <strong>${code}</strong>，请勿泄露给他人，5分钟内有效。`;
                    break;
                case EmailScene.BIND_EMAIL:
                    subject = "绑定邮箱验证码";
                    content = `您正在绑定邮箱，验证码为 <strong>${code}</strong>，请勿泄露给他人，5分钟内有效。`;
                    break;
                case EmailScene.CHANGE_EMAIL:
                    subject = "变更邮箱验证码";
                    content = `您正在变更邮箱，验证码为 <strong>${code}</strong>，请勿泄露给他人，5分钟内有效。`;
                    break;
                case EmailScene.FIND_PASSWORD:
                    subject = "找回密码验证码";
                    content = `您正在找回登录密码，验证码为 <strong>${code}</strong>，请勿泄露给他人，5分钟内有效。`;
                    break;
                default:
                    subject = "验证码";
                    content = `您的验证码为 <strong>${code}</strong>，请勿泄露给他人，5分钟内有效。`;
            }

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 16px; }
        .content { font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 24px; }
        .code { display: inline-block; background: #f0f0f0; padding: 8px 16px; border-radius: 4px; font-size: 24px; font-weight: 700; color: #333; letter-spacing: 4px; margin: 8px 0; }
        .footer { font-size: 12px; color: #999; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">${subject}</div>
        <div class="content">${content}</div>
        <div class="footer">如非本人操作，请忽略此邮件。</div>
    </div>
</body>
</html>`;

            await transporter.sendMail({
                from: `"系统通知" <${from}>`,
                to: email,
                subject,
                html,
            });

            await this.redisService.set(key, code, this.CODE_PREFIX_TIME);

            this.logger.log(`邮件验证码已发送至 ${email}`);

            return { success: true };
        } catch (error) {
            this.logger.error(`发送邮件验证码失败: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 验证邮件验证码
     */
    async verifyCode(email: string, code: string, scene: EmailSceneType = EmailScene.LOGIN) {
        const key = this.getCacheKey(email, scene);
        const storedCode = await this.redisService.get<string>(key);

        if (!storedCode || storedCode !== code) {
            throw HttpErrorFactory.badRequest("验证码已过期或不存在");
        }

        await this.redisService.del(key);

        return true;
    }

    /**
     * 清除邮件验证码
     */
    async clearCode(email: string, scene: EmailSceneType = EmailScene.LOGIN) {
        const key = this.getCacheKey(email, scene);
        await this.redisService.del(key);
    }

    /**
     * 发送测试邮件
     */
    async sendTestEmail(to: string): Promise<EmailSendResult> {
        try {
            const transporter = await this.createTransporter();
            const config = await this.emailConfigRepository.findOne({
                where: { enable: true },
                order: { sort: "ASC", createdAt: "ASC" },
            });

            const from = config?.smtpConfig?.from || config?.smtpConfig?.username || "";

            await transporter.sendMail({
                from: `"系统通知" <${from}>`,
                to,
                subject: "测试邮件",
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>测试邮件</title>
</head>
<body>
    <div style="max-width:600px;margin:0 auto;padding:32px;font-family:sans-serif;">
        <h2 style="color:#333;">测试邮件</h2>
        <p style="color:#555;line-height:1.6;">这是一封测试邮件，如果您收到此邮件，说明您的邮件配置已正确设置。</p>
        <p style="color:#999;font-size:12px;margin-top:24px;">发送时间: ${new Date().toLocaleString("zh-CN")}</p>
    </div>
</body>
</html>`,
            });

            return { success: true, message: "测试邮件发送成功" };
        } catch (error) {
            this.logger.error(`发送测试邮件失败: ${error.message}`, error.stack);
            throw HttpErrorFactory.internal(error.message || "测试邮件发送失败");
        }
    }
}
