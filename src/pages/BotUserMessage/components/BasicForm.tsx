import { useIntl } from '@umijs/max';
import React from 'react';
import {
  ProForm,
  ProFormDigit,
  ProFormList,
  ProFormText,
  ProFormTextArea,
  ProFormGroup,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BotUserMessageBasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  return (
    <ProForm
      initialValues={{
        ...values,
      }}
      onFinish={async (formData) => {
        await onFinish({
          ...formData,
        });
      }}
      submitter={{
        render: (props, dom) => (
          <div style={{ textAlign: 'right' }}>
            {dom.map((button, index) => (
              <span key={index} style={{ marginLeft: 8 }}>
                {button}
              </span>
            ))}
          </div>
        ),
      }}
    >
      <ProFormGroup>
        <ProFormTextArea
          name="content"
          width="md"
          label={intl.formatMessage({ id: 'content', defaultMessage: '消息内容' })}
          rules={[{ required: true, message: '请输入消息内容' }]}
          fieldProps={{
            autoSize: { minRows: 8 },
          }}
        />

        <ProFormDigit
          name="intervalTime"
          width="sm"
          label={intl.formatMessage({
            id: 'interval_time_hour',
            defaultMessage: '间隔时间(Hours)',
          })}
          min={0}
        />

        <ProFormDigit
          name="menus_per_row"
          width="sm"
          label={intl.formatMessage({ id: 'menus_per_row', defaultMessage: '每行菜单数' })}
          min={1}
          max={8}
        />
      </ProFormGroup>

      <ProFormGroup>
        <ProFormList
          name="menus"
          label={intl.formatMessage({ id: 'menu', defaultMessage: '内联菜单' })}
          creatorButtonProps={{
            position: 'bottom',
            creatorButtonText: '添加菜单',
          }}
          itemRender={({ listDom, action }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>{listDom}</div>
              {action}
            </div>
          )}
        >
          <ProFormGroup compact>
            <ProFormText
              name="menuName"
              label="菜单名"
              placeholder={intl.formatMessage({ id: 'menu_name', defaultMessage: '菜单名称' })}
              rules={[{ required: true, message: '请输入菜单名称' }]}
              width="md"
            />
            <ProFormText
              name="url"
              label={intl.formatMessage({ id: 'menu_url', defaultMessage: '菜单链接' })}
              placeholder="请输入 URL，例如 https://example.com"
              rules={[
                { required: true, message: '请输入链接地址' },
                {
                  type: 'url',
                  message: '请输入合法的 URL（必须以 http 或 https 开头）',
                  validateTrigger: 'onBlur',
                },
              ]}
              width="xl"
            />
          </ProFormGroup>
        </ProFormList>
      </ProFormGroup>

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BotUserMessageBasicForm;
