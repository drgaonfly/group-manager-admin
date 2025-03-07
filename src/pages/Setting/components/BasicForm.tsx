import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
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
        {newRecord && (
          <ProFormText
            width="md"
            label={intl.formatMessage({ id: 'key', defaultMessage: '键' })}
            name="key"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'please_enter_key',
                  defaultMessage: '请输入键',
                }),
              },
            ]}
          />
        )}
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'revenuePool', defaultMessage: '收益池' })}
          name="revenuePool"
        />
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'incomePool', defaultMessage: '玩家收入' })}
          name="incomePool"
        />
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'StakingApy', defaultMessage: '质押APY' })}
          name="StakingApy"
        />

        <ProForm.Group>
          <ProFormText
            width="md"
            label={intl.formatMessage({ id: 'totalOutput', defaultMessage: '总产量' })}
            name="totalOutput"
          />
          <ProFormText
            width="md"
            label={intl.formatMessage({ id: 'validNodes', defaultMessage: '有效节点' })}
            name="validNodes"
          />
          <ProFormText
            width="md"
            label={intl.formatMessage({ id: 'participants', defaultMessage: '参加人数' })}
            name="participants"
          />
          <ProFormText
            width="md"
            label={intl.formatMessage({ id: 'userEarnings', defaultMessage: '用户收益' })}
            name="userEarnings"
          />
        </ProForm.Group>

        <ProFormTextArea
          width="md"
          label={intl.formatMessage({ id: 'remark', defaultMessage: '备注' })}
          name="remark"
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
