import React from 'react';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { locationMapping, platformNames } from '@/utils/constants';
// import useQueryList from '@/hooks/useQueryList';
// import { useAccess } from '@umijs/max';

interface Props {
  newRecord?: boolean;
  file?: string | undefined;
  setFile?: (url: string) => void;
  reviewFile?: string | undefined;
  setReviewFile?: (url: string) => void;
  initialValues?: any;
}

const BasicForm: React.FC<Props> = ({}) => {
  // const access = useAccess();
  // const { items: users } = useQueryList('/users', access.canAdmin);

  return (
    <>
      <ProForm.Group>
        {/* {access.canAdmin && (
          <ProFormSelect
            rules={[{ required: true }]}
            options={users.map((user: any) => ({
              label: user.name,
              value: user._id,
            }))}
            width="md"
            name="user"
            label="用户"
            showSearch
          />
        )} */}
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

        <ProFormText
          rules={[{ required: false }]}
          width="md"
          label="下单账号序号"
          name="accountNumber"
          placeholder="请输入账号"
        />

        <ProFormText
          rules={[{ required: false }]}
          width="md"
          label="登录账号"
          name="loginAccount"
          placeholder="请输入登录账号"
        />

        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label="登录密码"
          name="loginPassword"
          placeholder="请输入登录密码"
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
