import React from 'react';
import { ProForm, ProFormDigit, ProFormSelect, ProFormText } from '@ant-design/pro-components';
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
              label: user.email,
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

        <ProFormDigit
          name="numberOfAccounts"
          label="账号数量"
          width="md"
          min={1} // Minimum number of accounts must be at least 1
          rules={[{ required: true, message: '请输入账号数量' }]}
          placeholder="请输入账号数量"
        />

        <ProFormText
          name="storeAccount"
          label="店铺账号"
          width="md"
          rules={[{ required: true, message: '请输入店铺账号' }]}
          placeholder="请输入店铺账号"
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
