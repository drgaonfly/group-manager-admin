import { useIntl } from '@umijs/max';
import React from 'react';
import {
  ProForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import EmployeeSelect from '@/components/employeeSelect';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const [form] = Form.useForm();

  const { items: customers, loading: loading } = useQueryList('/customers');

  return (
    <ProForm
      form={form}
      initialValues={{
        ...values,
        employee: values?.employee?._id,
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
        <ProFormDigit
          label={intl.formatMessage({ id: 'liquidRate' })}
          width="md"
          name="liquidRate"
          min={0}
          fieldProps={{
            precision: 2,
          }}
          rules={[{ required: true, message: '请输入流动倍率' }]}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'stakeRate' })}
          name="stakeRate"
          width="md"
          min={0}
          fieldProps={{
            precision: 2,
          }}
          rules={[{ required: true, message: '请输入质押倍率' }]}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormDigit
          label={intl.formatMessage({ id: 'usdtBalance', defaultMessage: 'USDT余额' })}
          name="usdtBalance"
          width="md"
          min={0}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'usdtStaking', defaultMessage: 'USDT质押' })}
          name="usdtStaking"
          width="md"
          min={0}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'usdtPlatform', defaultMessage: 'USDT平台' })}
          name="usdtPlatform"
          width="md"
          min={0}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'ethPlatform', defaultMessage: 'ETH平台' })}
          name="ethPlatform"
          width="md"
          min={0}
        />
      </ProForm.Group>

      <ProForm.Group>
        <EmployeeSelect />

        <ProFormSwitch
          width="md"
          name="isAuthorized"
          label={intl.formatMessage({ id: 'accountType', defaultMessage: '账户类型' })}
          checkedChildren={intl.formatMessage({ id: 'demoAccount' })}
          unCheckedChildren={intl.formatMessage({ id: 'customer' })}
          initialValue={false}
        />
        <ProFormSwitch
          width="md"
          name="isVerified"
          label={intl.formatMessage({ id: 'authStatus', defaultMessage: '授权状态' })}
          checkedChildren={intl.formatMessage({ id: 'authorized', defaultMessage: '授权' })}
          unCheckedChildren={intl.formatMessage({ id: 'unauthorized', defaultMessage: '未授权' })}
          initialValue={false}
        />
      </ProForm.Group>

      <ProFormTreeSelect
        name="parent"
        rules={[{ required: false }]}
        width="md"
        label={intl.formatMessage({ id: 'parent_customer_id' })}
        allowClear
        secondary
        fieldProps={{
          showArrow: false,
          treeDefaultExpandAll: true,
          filterTreeNode: true,
          showSearch: true,
          dropdownMatchSelectWidth: false,
          autoClearSearchValue: true,
          treeNodeFilterProp: 'name',
          fieldNames: {
            label: 'id',
            value: '_id',
            children: 'children',
          },
          treeData: customers,
          loading: loading,
        }}
      />

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
