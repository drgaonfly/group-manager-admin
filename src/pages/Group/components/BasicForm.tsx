import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormDigit, ProFormSelect } from '@ant-design/pro-components';
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
      <ProForm.Group>
        <ProFormText
          name="title"
          width="md"
          label={intl.formatMessage({ id: 'groupTitle', defaultMessage: '群组名称' })}
          rules={[{ required: true, message: '请输入群组名称' }]}
        />

        <ProFormSelect
          name="type"
          width="md"
          label={intl.formatMessage({ id: 'type', defaultMessage: '群组类型' })}
          valueEnum={{
            group: intl.formatMessage({ id: 'group' }),
          }}
        />

        <ProFormSelect
          name="bot"
          width="md"
          label={intl.formatMessage({ id: 'groupBot', defaultMessage: '机器人ID' })}
          placeholder="请输入 bot 对象 ID"
        />

        <ProFormSelect
          name="creator"
          width="md"
          label={intl.formatMessage({ id: 'groupCreator', defaultMessage: '创建者ID' })}
        />

        <ProFormSelect
          name="operators"
          label={intl.formatMessage({ id: 'groupOperators', defaultMessage: '操作人ID数组' })}
          mode="multiple"
        />

        <ProFormDigit
          name="exchange_rate"
          label={intl.formatMessage({ id: 'exchangeRate', defaultMessage: '汇率' })}
        />

        <ProFormDigit
          name="fee_rate"
          label={intl.formatMessage({ id: 'feeRate', defaultMessage: '费率（如0.02表示2%）' })}
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

export default GroupBasicForm;
