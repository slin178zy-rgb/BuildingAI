import { Column } from "typeorm";

import { AppEntity } from "../decorators/app-entity.decorator";
import { BaseEntity } from "./base";

/**
 * SMTP 邮件配置实体
 */
@AppEntity({ name: "email_config", comment: "邮件服务配置" })
export class EmailConfig extends BaseEntity {
    @Column({ type: "boolean", default: false, comment: "是否启用" })
    enable: boolean;

    @Column({ default: 0, comment: "排序" })
    sort: number;

    @Column({ type: "jsonb", nullable: true, comment: "SMTP配置" })
    smtpConfig: SmtpConfig | null;
}

/**
 * SMTP 配置类型
 */
export interface SmtpConfig {
    /** SMTP主机 */
    host: string;
    /** SMTP端口 */
    port: number;
    /** 是否启用SSL/TLS */
    secure: boolean;
    /** 是否强制AUTH LOGIN */
    authLogin: boolean;
    /** 用户名 */
    username: string;
    /** 发件地址 */
    from: string;
    /** 密码/访问令牌 */
    password: string;
}
