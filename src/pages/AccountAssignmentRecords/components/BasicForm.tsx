import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormDigit, ProFormText } from '@ant-design/pro-components';
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

        <ProFormDigit
          name="numberOfAccounts"
          label={intl.formatMessage({ id: 'account_quantity' })}
          width="md"
          min={1} // Minimum number of accounts must be at least 1
          rules={[
            { required: true, message: intl.formatMessage({ id: 'enter_account_quantity' }) },
          ]}
          placeholder={intl.formatMessage({ id: 'enter_account_quantity' })}
        />

        <ProFormText
          name="storeAccount"
          label={intl.formatMessage({ id: 'store_account' })}
          width="md"
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_store_account' }) }]}
          placeholder={intl.formatMessage({ id: 'enter_store_account' })}
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
