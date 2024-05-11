import { useIntl } from '@umijs/max';
import { ProForm, ProFormText, ProFormDigit } from '@ant-design/pro-components';
import React from 'react';

interface Props {
  newRecord?: boolean;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord }) => {
  const intl = useIntl();
  console.log(newRecord);
  return (
    <>
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_store_name' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'store_name' })}
          name="storeName"
          placeholder={intl.formatMessage({ id: 'enter_store_name' })}
        />
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_order_number' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'order_number' })}
          name="orderNumber"
          placeholder={intl.formatMessage({ id: 'enter_order_number' })}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'amount' })}
          name="amount"
          width="md"
          min={0}
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_amount' }) }]}
          placeholder={intl.formatMessage({ id: 'enter_amount' })}
        />
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_buyer_id' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'buyer_id' })}
          name="buyerId"
          placeholder={intl.formatMessage({ id: 'enter_buyer_id' })}
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
