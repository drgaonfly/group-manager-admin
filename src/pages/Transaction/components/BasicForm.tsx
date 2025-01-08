import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormCheckbox, ProFormSelect } from '@ant-design/pro-components';
import { Form, Input, Spin } from 'antd';
import useQueryList from '@/hooks/useQueryList';
import CustomerSelect from '@/components/customerSelect';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  const { items: roles, loading } = useQueryList('/roles');
  const filteredRoles = roles?.filter((role: { name: string }) => role.name === '客户'); // 只筛选出名称为员工的角色

  const filteredRolesIds = filteredRoles?.map((role: { _id: string }) => role._id);

  const [form] = Form.useForm();

  //表单初始化filteredRoles数据更新时，确保表单中的角色选择能加载出来
  React.useEffect(() => {
    if (filteredRoles) {
      form.setFieldsValue({
        roles: filteredRolesIds,
      });
    }
  }, [filteredRoles]);

  return (
    <ProForm
      form={form}
      initialValues={{
        ...values,
        roles: filteredRolesIds,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          roles: filteredRolesIds,
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
        <CustomerSelect />

        <ProFormText
          name={['wallet', 'address']}
          label={intl.formatMessage({ id: 'walletAddress' })}
          width="md"
        />

        <ProFormText
          name={['wallet', 'network']}
          label={intl.formatMessage({ id: 'network' })}
          width="md"
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormText
          name={['wallet', 'type']}
          label={intl.formatMessage({ id: 'walletType' })}
          width="md"
        />

        <ProFormSelect
          name="type"
          label={intl.formatMessage({ id: 'transactionType' })}
          width="md"
          options={[
            { label: '提现失败', value: 'WithdrawalFailed' },
            { label: '质押', value: 'Pledge' },
            { label: '静态收益', value: 'StaticIncome' },
            { label: '抽奖奖励', value: 'LotteryReward' },
            { label: '转出', value: 'TransferOut' },
            { label: '转入', value: 'TransferIn' },
          ]}
          rules={[{ required: true }]}
        />

        <ProFormText
          name="transactedBalance"
          label={intl.formatMessage({ id: 'transactedBalance' })}
          width="md"
          rules={[{ required: true }]}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormText
          name={['wallet', 'balance']}
          label={intl.formatMessage({ id: 'previousBalance' })}
          width="md"
          disabled
        />

        <ProFormText
          name="currentBalance"
          label={intl.formatMessage({ id: 'currentBalance' })}
          width="md"
          disabled
        />
      </ProForm.Group>

      <ProForm.Group>
        {newRecord &&
          (loading ? (
            <Spin spinning={loading} />
          ) : (
            <ProFormCheckbox.Group
              name="roles"
              layout="horizontal"
              label={intl.formatMessage({ id: 'role_choose' })}
              options={filteredRoles?.map((role: { name: string; _id: string }) => ({
                label: role.name,
                value: role._id,
              }))}
              fieldProps={{
                disabled: true, // 确保在 loading 时禁用复选框
              }}
            />
          ))}
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
