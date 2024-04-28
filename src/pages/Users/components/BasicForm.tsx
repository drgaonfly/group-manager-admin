import React, { useState } from 'react';
import { ProForm, ProFormText, ProFormSelect, EditableProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import useForm from 'antd/lib/form/hooks/useForm';
import { convertToTextObject, locationMapping } from '@/utils/constants';
import { Form, Input } from 'antd';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

type PriceListItem = {
  isLocalCurrency: boolean;
  exchangeRate: number;
  serviceFee: number;
  country: string;
  platform: string;
  _id: string;
};

const columns = [
  {
    title: '国家',
    dataIndex: 'country',
    valueType: 'select',
    valueEnum: convertToTextObject(locationMapping),
    formItemProps: {
      rules: [{ required: true, message: '请选择国家' }],
    },
    editable: true,
  },
  {
    title: '是否本币',
    dataIndex: 'isLocalCurrency',
    valueType: 'select',
    valueEnum: {
      true: { text: '是', status: 'Success' },
      false: { text: '否', status: 'Error' },
    },
    formItemProps: {
      rules: [{ required: true, message: '是否本币是必填项' }],
    },
    editable: true,
  },
  {
    title: '汇率',
    dataIndex: 'exchangeRate',
    formItemProps: {
      rules: [{ required: false, message: '汇率是必填项' }],
    },
    editable: true,
  },
  {
    title: '服务费',
    dataIndex: 'serviceFee',
    formItemProps: {
      rules: [{ required: false, message: '服务费是必填项' }],
    },
    editable: true,
  },
  {
    title: '操作',
    valueType: 'option',
    render: (text: any, record: any, _: any, action: any) => [
      <a
        key="editable"
        onClick={() => {
          action?.startEditable?.(`${record._id}`);
        }}
      >
        编辑
      </a>,
      // Add your logic for deleting a bill here
      // You'll need to adapt this to fit your actual data handling
    ],
  },
];

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const access = useAccess();
  const [form] = useForm();
  const [priceList, setPriceList] = useState<PriceListItem[]>(values?.priceList || []);

  return (
    <ProForm
      initialValues={{ ...values }}
      form={form}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          priceList: priceList.map(({ _id, ...rest }) => rest),
        });
        // form.resetFields();
      }}
    >
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: '请输入姓名' }]}
          width="md"
          label="姓名"
          name="name"
        />
        <ProFormText
          rules={[{ required: true, message: '请输入电子邮箱' }]}
          width="md"
          label="电子邮箱"
          name="email"
        />
        <ProFormText
          rules={[{ required: newRecord, message: '请输入密码' }]}
          width="md"
          label="密码"
          name="password"
        />
        {access.canSuperAdmin && (
          <ProFormSelect
            name="role"
            width="md"
            label="角色"
            valueEnum={{
              SUPER_ADMIN: '超级管理员',
              CUSTOMER: '客户',
              ORDER_CLERK: '下单员',
              ADMIN: '客服',
              FINANCIAL_STAFF: '财务人员',
            }}
          />
        )}
      </ProForm.Group>

      <EditableProTable<PriceListItem>
        rowKey="_id"
        headerTitle="价格表"
        // @ts-ignore
        columns={columns}
        value={priceList}
        onChange={(value: readonly PriceListItem[]) => setPriceList([...value])}
        editable={{
          type: 'multiple',
        }}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          position: 'bottom',
          record: () => ({
            _id: Date.now().toString(),
            isLocalCurrency: false,
            exchangeRate: 0,
            serviceFee: 0,
            country: '',
            platform: '',
          }),
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
