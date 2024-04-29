import { ProForm, ProFormText, ProFormDigit } from '@ant-design/pro-components';
import React from 'react';

interface Props {
  newRecord?: boolean;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord }) => {
  console.log(newRecord);
  return (
    <>
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: '请输入店铺名字' }]}
          width="md"
          label="店铺名字"
          name="storeName"
          placeholder="请输入店铺名字"
        />
        <ProFormText
          rules={[{ required: true, message: '请输入订单号' }]}
          width="md"
          label="订单号"
          name="orderNumber"
          placeholder="请输入订单号"
        />
        <ProFormDigit
          label="金额"
          name="amount"
          width="md"
          min={0}
          rules={[{ required: true, message: '请输入金额' }]}
          placeholder="请输入金额"
        />
        <ProFormText
          rules={[{ required: true, message: '请输入买手号' }]}
          width="md"
          label="买手号"
          name="buyerId"
          placeholder="请输入买手号"
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
