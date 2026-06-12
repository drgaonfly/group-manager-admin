import React from 'react';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import AdRemovalGroupSelect from './AdRemovalGroupSelect';

export interface AdRemovalFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialValues?: any;
  loading?: boolean;
  botId: string;
}

/**
 * 将 keywords 二维数组转成 textarea 字符串
 * [["广告", "推广"], ["代理"]] → "广告 推广\n代理"
 */
function keywordsToText(keywords: string[][] | undefined): string {
  if (!keywords || keywords.length === 0) return '';
  return keywords.map((line) => line.join(' ')).join('\n');
}

/**
 * 将 textarea 字符串解析回二维数组
 * "广告 推广\n代理" → [["广告", "推广"], ["代理"]]
 */
function textToKeywords(text: string): string[][] {
  return text
    .split('\n')
    .map((line) => line.trim().split(/\s+/).filter(Boolean))
    .filter((line) => line.length > 0);
}

const AdRemovalForm: React.FC<AdRemovalFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading,
  botId,
}) => {
  const isEdit = !!initialValues?._id;

  // 把后端数据转成表单用的格式
  const formInitialValues = React.useMemo(() => {
    if (initialValues) {
      return {
        ...initialValues,
        keywordsText: keywordsToText(initialValues.keywords),
        punishmentType: initialValues.punishment?.type ?? 'none',
        muteDuration: initialValues.punishment?.muteDuration ?? 300,
        // group 是 ObjectId 对象或字符串，统一转成字符串
        group: initialValues.group
          ? typeof initialValues.group === 'object'
            ? initialValues.group._id ?? initialValues.group.toString()
            : initialValues.group
          : undefined,
      };
    }
    return {
      isOnline: true,
      mode: 'any',
      punishmentType: 'none',
      muteDuration: 300,
      group: undefined,
    };
  }, [initialValues]);

  const handleSubmit = async (values: any) => {
    const { keywordsText, punishmentType, muteDuration, ...rest } = values;

    const keywords = textToKeywords(keywordsText || '');

    let punishment: { type: string; muteDuration?: number } | null = null;
    if (punishmentType === 'mute') {
      punishment = { type: 'mute', muteDuration: Number(muteDuration) };
    } else if (punishmentType === 'kick') {
      punishment = { type: 'kick' };
    }

    // group 为 undefined/null 时传 null，让后端清空（全部群组生效）
    await onSubmit({ ...rest, keywords, punishment, group: rest.group || null });
  };

  return (
    <ModalForm
      title={isEdit ? '编辑拦截规则' : '添加拦截规则'}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) onCancel();
      }}
      initialValues={formInitialValues}
      onFinish={handleSubmit}
      modalProps={{
        destroyOnClose: true,
        confirmLoading: loading,
        width: '60%',
        style: { maxWidth: 900, minWidth: 580 },
      }}
    >
      {/* 基本信息 */}
      <ProFormGroup>
        <ProFormText
          name="name"
          label="规则名称"
          placeholder="例如：通用广告拦截"
          rules={[{ required: true, message: '请输入规则名称' }]}
          width="lg"
        />
        <ProFormTextArea
          name="remark"
          label="备注"
          placeholder="规则描述信息"
          fieldProps={{ autoSize: { minRows: 3 } }}
          width="lg"
        />
      </ProFormGroup>

      {/* 适用群组 */}
      <AdRemovalGroupSelect botId={botId} />

      {/* 匹配设置 */}
      <ProFormGroup>
        <ProFormSelect
          name="mode"
          label="行内匹配模式"
          tooltip="每行可填多个词（空格分隔）。any = 命中行内任意词触发；all = 行内所有词都出现才触发"
          valueEnum={{
            any: '命中任意词 (OR)',
            all: '命中全部词 (AND)',
          }}
          width="md"
        />
      </ProFormGroup>

      {/* 关键词 */}
      <ProFormTextArea
        name="keywordsText"
        label="关键词"
        tooltip="每行一条规则，行与行之间是「或」关系（OR）；同一行内多个词用空格隔开，匹配逻辑由上方「行内匹配模式」决定"
        placeholder={`每行一条规则，同一行多个词用空格隔开，例如：\n广告 推广 引流\n代理招募\n加我微信`}
        rules={[{ required: true, message: '请输入至少一行关键词' }]}
        fieldProps={{
          autoSize: { minRows: 6, maxRows: 16 },
          style: { fontFamily: 'monospace', fontSize: 13 },
        }}
      />

      {/* 处罚设置 */}
      <ProFormRadio.Group
        name="punishmentType"
        label="触发处罚"
        tooltip="命中规则后，删除消息是默认动作；此处可额外设置对发送者的处罚"
        options={[
          { label: '仅删除消息', value: 'none' },
          { label: '禁言', value: 'mute' },
          { label: '踢出群', value: 'kick' },
        ]}
      />

      {/* 禁言时长：仅 punishmentType=mute 时显示 */}
      <Form.Item noStyle shouldUpdate={(prev, cur) => prev.punishmentType !== cur.punishmentType}>
        {({ getFieldValue }) =>
          getFieldValue('punishmentType') === 'mute' ? (
            <ProFormDigit
              name="muteDuration"
              label="禁言时长"
              tooltip="单位：秒。例如 300 = 禁言 5 分钟，86400 = 禁言 1 天"
              min={1}
              max={31536000}
              fieldProps={{ addonAfter: '秒', precision: 0 }}
              rules={[{ required: true, message: '请输入禁言时长' }]}
              width="sm"
            />
          ) : null
        }
      </Form.Item>
    </ModalForm>
  );
};

export default AdRemovalForm;
