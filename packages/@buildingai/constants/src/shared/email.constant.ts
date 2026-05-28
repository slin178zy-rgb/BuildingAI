/**
 * 邮件验证码场景
 */
export const EmailScene = {
    /** 登录 */
    LOGIN: 1,
    /** 注册 */
    REGISTER: 2,
    /** 绑定邮箱 */
    BIND_EMAIL: 3,
    /** 修改邮箱 */
    CHANGE_EMAIL: 4,
    /** 找回密码 */
    FIND_PASSWORD: 5,
} as const;
export type EmailSceneType = (typeof EmailScene)[keyof typeof EmailScene];

/**
 * 邮件模板配置
 */
export interface EmailTemplateConfig {
    enable?: boolean;
    subject?: string;
    content?: string;
}
