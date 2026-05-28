import { BaseController } from "@buildingai/base";
import {
    SmsProvider,
    type SmsProviderType,
    SmsScene,
    type SmsSceneType,
} from "@buildingai/constants/shared/sms.constant";
import { HttpErrorFactory } from "@buildingai/errors";
import { ConsoleController } from "@common/decorators/controller.decorator";
import { Permissions } from "@common/decorators/permissions.decorator";
import { Body, Get, Param, Patch, Post } from "@nestjs/common";

import {
    SendTestEmailDto,
    UpdateEmailConfigDto,
    UpdateEmailConfigStatusDto,
} from "../../dto/email-config.dto";
import {
    UpdateAliyunSmsConfigDto,
    UpdateSmsConfigStatusDto,
    UpdateSmsSceneTemplateDto,
    UpdateTencentSmsConfigDto,
} from "../../dto/sms-config.dto";
import { NoticeService } from "../../services/notice.service";

@ConsoleController("notice", "通知")
export class NoticeConsoleController extends BaseController {
    constructor(private readonly noticeService: NoticeService) {
        super();
    }

    /**
     * 获取短信配置
     *
     * @param provider 短信服务商（aliyun | tencent）
     */
    @Get("sms-config/:provider")
    @Permissions({
        code: "sms-config-detail",
        name: "获取短信配置",
        description: "获取短信服务商配置",
    })
    async getSmsConfig(@Param("provider") provider: SmsProviderType) {
        if (!Object.values(SmsProvider).includes(provider)) {
            throw HttpErrorFactory.badRequest("不支持的短信服务商");
        }

        return this.noticeService.getSmsConfig(provider);
    }

    /**
     * 更新短信配置
     *
     * @param provider 短信服务商（aliyun | tencent）
     * @param body 提交的配置内容
     */
    @Post("sms-config/aliyun")
    @Permissions({
        code: "sms-config-update-aliyun",
        name: "更新阿里云短信配置",
        description: "更新阿里云短信配置（不包含启用状态）",
    })
    async updateAliyunSmsConfig(@Body() body: UpdateAliyunSmsConfigDto) {
        return this.noticeService.updateSmsProviderConfig(SmsProvider.ALIYUN, body);
    }

    @Post("sms-config/tencent")
    @Permissions({
        code: "sms-config-update-tencent",
        name: "更新腾讯云短信配置",
        description: "更新腾讯云短信配置（不包含启用状态）",
    })
    async updateTencentSmsConfig(@Body() body: UpdateTencentSmsConfigDto) {
        return this.noticeService.updateSmsProviderConfig(SmsProvider.TENCENT, body);
    }

    /**
     * 更新短信渠道启用状态
     *
     * 注意：短信渠道同一时间只能启用一个，启用当前渠道会自动禁用其它渠道。
     */
    @Patch("sms-config/:provider/status")
    @Permissions({
        code: "sms-config-update-status",
        name: "更新短信渠道状态",
        description: "启用/禁用短信渠道（互斥启用）",
    })
    async updateSmsConfigStatus(
        @Param("provider") provider: SmsProviderType,
        @Body() body: UpdateSmsConfigStatusDto,
    ) {
        if (!Object.values(SmsProvider).includes(provider)) {
            throw HttpErrorFactory.badRequest("不支持的短信服务商");
        }

        return this.noticeService.updateSmsProviderEnable(provider, Boolean(body.enable));
    }

    /**
     * 获取通知设置页短信场景配置
     */
    @Get("sms-scene-settings")
    @Permissions({
        code: "sms-scene-settings-detail",
        name: "获取短信通知场景配置",
        description: "获取通知设置中的短信场景配置列表",
    })
    async getSmsSceneSettings() {
        return this.noticeService.getSmsSceneSettings();
    }

    /**
     * 更新通知设置页单个短信场景配置
     */
    @Patch("sms-scene-settings/:scene")
    @Permissions({
        code: "sms-scene-settings-update",
        name: "更新短信通知场景配置",
        description: "更新通知设置中单个短信场景的启用状态、模板ID与短信内容",
    })
    async updateSmsSceneSetting(
        @Param("scene") scene: string,
        @Body() body: UpdateSmsSceneTemplateDto,
    ) {
        const sceneValue = Number(scene) as SmsSceneType;
        if (!Object.values(SmsScene).includes(sceneValue)) {
            throw HttpErrorFactory.badRequest("不支持的短信通知场景");
        }

        return this.noticeService.updateSmsSceneSetting(sceneValue, {
            enable: Boolean(body.enable),
            templateId: body.templateId,
            content: body.content,
        });
    }

    // ==================== 邮件配置相关接口 ====================

    /**
     * 获取邮件 SMTP 配置
     */
    @Get("email-config")
    @Permissions({
        code: "email-config-detail",
        name: "获取邮件配置",
        description: "获取邮件 SMTP 配置",
    })
    async getEmailConfig() {
        return this.noticeService.getEmailConfig();
    }

    /**
     * 更新邮件 SMTP 配置
     */
    @Post("email-config")
    @Permissions({
        code: "email-config-update",
        name: "更新邮件配置",
        description: "更新邮件 SMTP 配置",
    })
    async updateEmailConfig(@Body() body: UpdateEmailConfigDto) {
        return this.noticeService.updateEmailConfig({
            host: body.host,
            port: body.port,
            secure: body.secure ?? true,
            authLogin: body.authLogin ?? false,
            username: body.username,
            from: body.from,
            password: body.password,
        });
    }

    /**
     * 更新邮件渠道启用状态
     */
    @Patch("email-config/status")
    @Permissions({
        code: "email-config-update-status",
        name: "更新邮件渠道状态",
        description: "启用/禁用邮件渠道",
    })
    async updateEmailConfigStatus(@Body() body: UpdateEmailConfigStatusDto) {
        return this.noticeService.updateEmailEnable(Boolean(body.enable));
    }
}
