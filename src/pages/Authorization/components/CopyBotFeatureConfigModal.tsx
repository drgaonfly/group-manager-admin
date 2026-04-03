import { copyBotFeatureConfig, queryList } from '@/services/ant-design-pro/api';
import { ModalForm, ProFormDependency, ProFormSelect } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Form, message } from 'antd';
import React, { useEffect, useState } from 'react';

export type CopyBotFeatureConfigModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const CopyBotFeatureConfigModal: React.FC<CopyBotFeatureConfigModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [botOptions, setBotOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await queryList('/bots', { current: 1, pageSize: 1000 });
        const list = (res as any)?.data ?? [];
        setBotOptions(
          list.map((b: any) => ({
            value: b._id,
            label: `${b.botName || b.userName || b._id}${b.userName ? ` (@${b.userName})` : ''}`,
          })),
        );
      } catch {
        setBotOptions([]);
      }
    })();
  }, [open]);

  return (
    <ModalForm
      form={form}
      title={intl.formatMessage({
        id: 'copy_bot_feature_config',
        defaultMessage: '复制功能配置到其他机器人',
      })}
      width={520}
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{ destroyOnClose: true, maskClosable: false }}
      onFinish={async (values) => {
        const { sourceBotId, targetBotId } = values;
        if (!sourceBotId || !targetBotId) {
          message.error(
            intl.formatMessage({
              id: 'copy_bot_feature_config.select_both',
              defaultMessage: '请选择源机器人与目标机器人',
            }),
          );
          return false;
        }
        if (sourceBotId === targetBotId) {
          message.error(
            intl.formatMessage({
              id: 'copy_bot_feature_config.same_bot',
              defaultMessage: '源与目标不能是同一机器人',
            }),
          );
          return false;
        }
        try {
          await copyBotFeatureConfig({ sourceBotId, targetBotId });
          message.success(
            intl.formatMessage({
              id: 'copy_bot_feature_config.success',
              defaultMessage: '功能配置复制成功',
            }),
          );
          onSuccess?.();
          return true;
        } catch (e: any) {
          message.error(
            e?.response?.data?.message ??
              e?.message ??
              intl.formatMessage({
                id: 'copy_bot_feature_config.failed',
                defaultMessage: '复制失败',
              }),
          );
          return false;
        }
      }}
    >
      <ProFormSelect
        name="sourceBotId"
        label={intl.formatMessage({
          id: 'copy_bot_feature_config.source',
          defaultMessage: '源机器人（复制其配置）',
        })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'required', defaultMessage: '必填' }),
          },
        ]}
        options={botOptions}
        showSearch
        fieldProps={{
          optionFilterProp: 'label',
          onChange: (id: string) => {
            const target = form.getFieldValue('targetBotId');
            if (target && String(target) === String(id)) {
              form.setFieldsValue({ targetBotId: undefined });
            }
          },
        }}
      />
      <ProFormDependency name={['sourceBotId']}>
        {({ sourceBotId }) => {
          const targetOptions = botOptions.filter(
            (o) => !sourceBotId || String(o.value) !== String(sourceBotId),
          );
          return (
            <ProFormSelect
              name="targetBotId"
              label={intl.formatMessage({
                id: 'copy_bot_feature_config.target',
                defaultMessage: '目标机器人（将被覆盖）',
              })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'required', defaultMessage: '必填' }),
                },
              ]}
              options={targetOptions}
              showSearch
              fieldProps={{ optionFilterProp: 'label' }}
            />
          );
        }}
      </ProFormDependency>
      <div style={{ color: '#999', fontSize: 12, marginTop: -8 }}>
        <FormattedMessage
          id="copy_bot_feature_config.hint"
          defaultMessage="将覆盖目标机器人的功能开关、菜单/键盘/预设、群欢迎与群验证、群发与频道推广规则（群组/频道需重新绑定）、关键词回复、签到、抽奖、双向消息与老师资料等。不会复制 Token、归属用户与群组绑定。"
        />
      </div>
    </ModalForm>
  );
};

export default CopyBotFeatureConfigModal;
