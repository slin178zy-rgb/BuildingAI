/**
 * 认证相关常量
 * @description 定义登录和认证相关的常量
 */

/**
 * 登录方式类型（数字枚举）
 */
export const LOGIN_TYPE = {
    /** 账号登录 */
    ACCOUNT: 1,
    /** 手机号登录 */
    PHONE: 2,
    /** 微信登录 */
    WECHAT: 3,
    /** 邮箱登录 */
    EMAIL: 4,
} as const;
export type LoginType = (typeof LOGIN_TYPE)[keyof typeof LOGIN_TYPE];

/**
 * 登录方式标签映射
 */
export const LOGIN_TYPE_LABEL: Record<LoginType, string> = {
    [LOGIN_TYPE.ACCOUNT]: "账号",
    [LOGIN_TYPE.PHONE]: "手机号",
    [LOGIN_TYPE.WECHAT]: "微信",
    [LOGIN_TYPE.EMAIL]: "邮箱",
};

/**
 * 登录方式映射
 */
export const LOGIN_TYPE_MAP: Record<number, string> = {
    [LOGIN_TYPE.ACCOUNT]: "账号登录",
    [LOGIN_TYPE.PHONE]: "手机号登录",
    [LOGIN_TYPE.WECHAT]: "微信登录",
    [LOGIN_TYPE.EMAIL]: "邮箱登录",
};
