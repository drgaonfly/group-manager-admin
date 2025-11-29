import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import BotSelect from '@/components/BotSelect';

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
        bot: values?.bot?._id || values?.bot,
      }}
      onFinish={onFinish}
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
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'title', defaultMessage: '标题' })}
          name="title"
        />

        <BotSelect newRecord={newRecord} />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormText
          rules={[]}
          width="md"
          label={intl.formatMessage({ id: 'link', defaultMessage: '链接' })}
          name="link"
        />
      </ProForm.Group>

      <ProFormTextArea
        rules={[]}
        width="xl"
        label={intl.formatMessage({ id: 'remark', defaultMessage: '备注' })}
        name="remark"
        fieldProps={{
          autoSize: {
            minRows: 8,
          },
        }}
      />

      {!newRecord && (
        <Form.Item name="_id" hidden>
          <Input />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
