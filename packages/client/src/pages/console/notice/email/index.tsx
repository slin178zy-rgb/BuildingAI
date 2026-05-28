import { useEmailConfigQuery, useUpdateEmailConfigMutation, useUpdateEmailConfigStatusMutation } from "@buildingai/services/console";
import { PermissionGuard } from "@buildingai/ui/components/auth/permission-guard";
import { Button } from "@buildingai/ui/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@buildingai/ui/components/ui/field";
import { Input } from "@buildingai/ui/components/ui/input";
import { Label } from "@buildingai/ui/components/ui/label";
import { Switch } from "@buildingai/ui/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PageContainer } from "@/layouts/console/_components/page-container";

const emailConfigSchema = z.object({
  host: z.string().min(1, "SMTP主机不能为空"),
  port: z.coerce.number().min(1, "SMTP端口必须大于0"),
  secure: z.boolean(),
  authLogin: z.boolean(),
  username: z.string().min(1, "用户名不能为空"),
  from: z.string().email("发件地址格式不正确"),
  password: z.string().min(1, "密码/访问令牌不能为空"),
});

type EmailConfigFormValues = z.infer<typeof emailConfigSchema>;

const defaultConfig: EmailConfigFormValues = {
  host: "",
  port: 465,
  secure: true,
  authLogin: false,
  username: "",
  from: "",
  password: "",
};

const EmailConfigPage = () => {
  const { data, isLoading } = useEmailConfigQuery();
  const updateMutation = useUpdateEmailConfigMutation({
    onSuccess: () => {
      toast.success("保存成功");
    },
    onError: (e) => {
      toast.error(`保存失败: ${e.message}`);
    },
  });
  const statusMutation = useUpdateEmailConfigStatusMutation({
    onSuccess: (data) => {
      toast.success(data.enable ? "已启用邮件服务" : "已禁用邮件服务");
    },
    onError: (e) => {
      toast.error(`操作失败: ${e.message}`);
    },
  });

  const form = useForm<EmailConfigFormValues>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: defaultConfig,
  });

  useEffect(() => {
    if (data) {
      form.reset({
        host: data.host || "",
        port: data.port || 465,
        secure: data.secure ?? true,
        authLogin: data.authLogin ?? false,
        username: data.username || "",
        from: data.from || "",
        password: data.password || "",
      });
    }
  }, [data, form]);

  const onSubmit = (values: EmailConfigFormValues) => {
    updateMutation.mutate(values);
  };

  const handleToggleEnable = (enable: boolean) => {
    statusMutation.mutate({ enable });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center py-12">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PermissionGuard permissions="email-config-detail">
        <div className="space-y-6 px-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">邮件配置</h1>
            <PermissionGuard permissions="email-config-update-status">
              <div className="flex items-center gap-3">
                <Label htmlFor="email-enable">启用邮件服务</Label>
                <Switch
                  id="email-enable"
                  checked={data?.enable ?? false}
                  onCheckedChange={handleToggleEnable}
                  disabled={statusMutation.isPending}
                />
              </div>
            </PermissionGuard>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup className="max-w-xl gap-5">
              <Field>
                <FieldLabel>
                  SMTP主机 <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...form.register("host")}
                  placeholder="如: smtp.example.com"
                />
                {form.formState.errors.host && (
                  <FieldDescription className="text-destructive">
                    {form.formState.errors.host.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel>
                  SMTP端口 <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...form.register("port")}
                  type="number"
                  placeholder="如: 465"
                />
                {form.formState.errors.port && (
                  <FieldDescription className="text-destructive">
                    {form.formState.errors.port.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>启用 SSL/TLS</FieldLabel>
                  <Switch
                    checked={form.watch("secure")}
                    onCheckedChange={(v) => form.setValue("secure", v)}
                  />
                </div>
                <FieldDescription>
                  建议启用，大多数邮件服务商要求使用 SSL/TLS 加密连接
                </FieldDescription>
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>强制 AUTH LOGIN</FieldLabel>
                  <Switch
                    checked={form.watch("authLogin")}
                    onCheckedChange={(v) => form.setValue("authLogin", v)}
                  />
                </div>
                <FieldDescription>
                  部分邮件服务商需要强制使用 AUTH LOGIN 认证方式
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>
                  用户名 <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...form.register("username")}
                  placeholder="SMTP 登录用户名"
                />
                {form.formState.errors.username && (
                  <FieldDescription className="text-destructive">
                    {form.formState.errors.username.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel>
                  发件地址 <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...form.register("from")}
                  placeholder="如: noreply@example.com"
                />
                {form.formState.errors.from && (
                  <FieldDescription className="text-destructive">
                    {form.formState.errors.from.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel>
                  密码 / 访问令牌 <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...form.register("password")}
                  type="password"
                  placeholder="SMTP 登录密码或访问令牌"
                />
                {form.formState.errors.password && (
                  <FieldDescription className="text-destructive">
                    {form.formState.errors.password.message}
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>

            <div className="flex gap-3">
              <PermissionGuard permissions="email-config-update">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  保存配置
                </Button>
              </PermissionGuard>
            </div>
          </form>
        </div>
      </PermissionGuard>
    </PageContainer>
  );
};

export default EmailConfigPage;
