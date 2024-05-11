import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import CountrySelect from '@/components/CountrySelect';
import PlatformSelect from '@/components/PlatformSelect';
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
  const intl = useIntl();
  // const access = useAccess();
  // const { items: users } = useQueryList('/users', access.canAdmin);

  return (
    <>
      <ProForm.Group>
        {/* {access.canAdmin && (
          <UserSelect />
        )} */}
        <CountrySelect />

        <PlatformSelect />

        <ProFormText
          rules={[{ required: false }]}
          width="md"
          label={intl.formatMessage({ id: 'order_account_number' })}
          name="accountNumber"
          placeholder={intl.formatMessage({ id: 'enter_account' })}
        />

        <ProFormText
          rules={[{ required: false }]}
          width="md"
          label={intl.formatMessage({ id: 'login_account' })}
          name="loginAccount"
          placeholder={intl.formatMessage({ id: 'enter_login_account' })}
        />

        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'login_password' })}
          name="loginPassword"
          placeholder={intl.formatMessage({ id: 'enter_login_password' })}
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
