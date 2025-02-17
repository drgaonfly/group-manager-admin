import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormDigit } from '@ant-design/pro-components';
import { Form, Input } from 'antd';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const [form] = Form.useForm();

  return (
    <ProForm
      form={form}
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
        <ProFormDigit
          label={intl.formatMessage({ id: 'totalOutput', defaultMessage: '总产量' })}
          name="totalOutput"
          min={0}
          width="md"
          fieldProps={{
            precision: 2,
          }}
          rules={[{ required: true, message: '请输入总产量' }]}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'validNodes', defaultMessage: '有效节点' })}
          name="validNodes"
          min={0}
          width="md"
          fieldProps={{
            precision: 0,
          }}
          rules={[{ required: true, message: '请输入有效节点' }]}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormDigit
          label={intl.formatMessage({ id: 'participants', defaultMessage: '参加人数' })}
          name="participants"
          min={0}
          width="md"
          fieldProps={{
            precision: 0,
          }}
          rules={[{ required: true, message: '请输入参加人数' }]}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'userEarnings', defaultMessage: '用户收益' })}
          name="userEarnings"
          min={0}
          width="md"
          fieldProps={{
            precision: 2,
          }}
          rules={[{ required: true, message: '请输入用户收益' }]}
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
