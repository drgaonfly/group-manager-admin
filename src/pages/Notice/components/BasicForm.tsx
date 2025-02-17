import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
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
        <ProFormText name="title" width="md" label={intl.formatMessage({ id: 'noticeTitle' })} />

        <ProFormSelect
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'please_select_notice_type' }),
            },
          ]}
          width="md"
          label={intl.formatMessage({ id: 'noticeType' })}
          name="type"
          initialValue="notice"
          options={[
            {
              label: intl.formatMessage({ id: 'notice' }),
              value: 'notice',
              disabled: false,
            },
            {
              label: intl.formatMessage({ id: 'propaganda' }),
              value: 'propaganda',
              disabled: false,
            },
          ]}
        />

        <ProFormTextArea
          name="content"
          label={<FormattedMessage id="content" defaultMessage="内容" />}
          placeholder={intl.formatMessage({
            id: 'please_enter_content',
            defaultMessage: '请输入内容',
          })}
          width="xl"
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
