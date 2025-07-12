import { useIntl } from '@umijs/max';
import React from 'react';
import {
  ProForm,
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProFormGroup,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const GroupBasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  return (
    <ProForm
      initialValues={{
        ...values,
        bot: values?.bot?.id,
        creator: values?.creator?.id,
        operators: values?.operators.map((operator: any) => operator?.id),
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
        <ProFormText
          name="title"
          width="md"
          label={intl.formatMessage({ id: 'groupTitle', defaultMessage: '群组名称' })}
          rules={[{ required: true, message: '请输入群组名称' }]}
          disabled
        />

        <ProFormSelect
          name="type"
          width="md"
          label={intl.formatMessage({ id: 'type', defaultMessage: '群组类型' })}
          valueEnum={{
            group: intl.formatMessage({ id: 'group' }),
          }}
          disabled
        />

        <ProFormSelect
          name="bot"
          width="md"
          label={intl.formatMessage({ id: 'groupBot', defaultMessage: '机器人ID' })}
          placeholder="请输入 bot 对象 ID"
          disabled
        />

        <ProFormSelect
          name="creator"
          width="md"
          label={intl.formatMessage({ id: 'groupCreator', defaultMessage: '创建者ID' })}
          disabled
        />

        <ProFormTextArea
          name="message"
          width="md"
          label={intl.formatMessage({ id: 'content', defaultMessage: '内容' })}
          fieldProps={{
            autoSize: { minRows: 6 },
          }}
        />

        <ProFormSelect
          name="operators"
          width="md"
          label={intl.formatMessage({ id: 'groupOperators', defaultMessage: '操作人ID数组' })}
          mode="multiple"
          disabled
        />

        <ProFormDigit
          name="exchange_rate"
          width="md"
          label={intl.formatMessage({ id: 'exchangeRate', defaultMessage: '汇率' })}
        />

        <ProFormDigit
          name="fee_rate"
          width="md"
          label={intl.formatMessage({ id: 'feeRate', defaultMessage: '费率（如0.02表示2%）' })}
        />
      </ProFormGroup>

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default GroupBasicForm;
