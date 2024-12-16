import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { Form, Input } from 'antd';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  return (
    <ProForm
      initialValues={{
        ...values,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
        });
      }}
      submitter={{
        render: (props, dom) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {dom.map((button, index) => (
                <span key={index} style={{ marginLeft: 8 }}>
                  {button}
                </span>
              ))}
            </div>
          );
        },
      }}
    >
      <ProForm.Group>
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'messageId', defaultMessage: '消息ID' })}
          name="messageId"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'botName', defaultMessage: '机器人名称' })}
          name="botName"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'chatGroup', defaultMessage: '群组名称' })}
          name="chatGroup"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'sender', defaultMessage: '发送者' })}
          name="sender"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'content', defaultMessage: '消息内容' })}
          name="content"
        />

        <ProFormSelect
          width="md"
          label={intl.formatMessage({ id: 'messageType', defaultMessage: '消息类型' })}
          name="messageType"
          options={[
            {
              label: intl.formatMessage({ id: 'messageType.text', defaultMessage: '文本' }),
              value: 'text',
            },
            {
              label: intl.formatMessage({ id: 'messageType.photo', defaultMessage: '照片' }),
              value: 'photo',
            },
            {
              label: intl.formatMessage({ id: 'messageType.video', defaultMessage: '视频' }),
              value: 'video',
            },
            {
              label: intl.formatMessage({ id: 'messageType.document', defaultMessage: '文档' }),
              value: 'document',
            },
            {
              label: intl.formatMessage({ id: 'messageType.other', defaultMessage: '其他' }),
              value: 'other',
            },
          ]}
        />
      </ProForm.Group>

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
