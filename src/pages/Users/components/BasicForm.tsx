import React from 'react';
import {
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormList,
  ProFormDigit,
  ProFormRadio,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import useForm from 'antd/lib/form/hooks/useForm';
import { locationMapping, platformNames } from '@/utils/constants';
import { Form, Input } from 'antd';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const access = useAccess();
  const [form] = useForm();

  return (
    <ProForm
      initialValues={{ ...values }}
      form={form}
      onFinish={async (values) => {
        await onFinish(values);
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

      <ProFormList
        name="priceList"
        label="价格表"
        creatorButtonProps={{
          creatorButtonText: '添加价格规则',
        }}
      >
        {(field, index) => (
          <ProForm.Group key={field.key}>
            <ProForm.Group>
              <ProFormSelect
                name="country"
                label="国家"
                width="md"
                rules={[{ required: true, message: '请选择国家' }]}
                valueEnum={locationMapping}
                placeholder="请选择国家"
              />

              <ProFormSelect
                name="platform"
                label="平台"
                width="md"
                rules={[{ required: true, message: '请选择平台' }]}
                valueEnum={platformNames}
                placeholder="请选择平台"
              />
            </ProForm.Group>
            <ProFormRadio.Group
              name="isLocalCurrency"
              label="是否本币"
              width="lg"
              options={[
                { label: '是', value: true },
                { label: '否', value: false },
              ]}
              fieldProps={{
                onChange: (e) => {
                  const updatedPriceList = form
                    .getFieldValue('priceList')
                    .map((item: any, idx: number) => {
                      if (idx === index) {
                        return { ...item, isLocalCurrency: e.target.value };
                      }
                      return item;
                    });
                  form.setFieldsValue({ priceList: updatedPriceList });
                },
              }}
            />
            {!form.getFieldValue(['priceList', index, 'isLocalCurrency']) && (
              <ProForm.Group>
                <ProFormDigit
                  name="exchangeRate"
                  label="汇率"
                  width="md"
                  min={0}
                  fieldProps={{ step: 0.01 }}
                  rules={[{ required: true, message: '请输入汇率' }]}
                />
                <ProFormDigit
                  name="serviceFee"
                  label="服务费"
                  width="md"
                  min={0}
                  fieldProps={{ step: 0.01 }}
                  rules={[{ required: true, message: '请输入服务费' }]}
                />
              </ProForm.Group>
            )}
          </ProForm.Group>
        )}
      </ProFormList>
      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
