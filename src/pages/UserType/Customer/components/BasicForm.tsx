import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormTreeSelect } from '@ant-design/pro-components';
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
      <EmployeeSelect />

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
