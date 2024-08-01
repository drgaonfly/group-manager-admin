import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import useForm from 'antd/lib/form/hooks/useForm';
// import { convertToTextObject, locationMapping } from '@/utils/constants';
import { Form, Input } from 'antd';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

// type PriceListItem = {
//   isLocalCurrency: boolean;
//   exchangeRate: number;
//   serviceFee: number;
//   country: string;
//   platform: string;
//   _id: string;
// };

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const access = useAccess();
  const [form] = useForm();
  // const [priceList, setPriceList] = useState<PriceListItem[]>(values?.priceList || []);
  // const columns = [
  //   {
  //     title: intl.formatMessage({ id: 'country' }),
  //     dataIndex: 'country',
  //     valueType: 'select',
  //     valueEnum: convertToTextObject(locationMapping),
  //     formItemProps: {
  //       rules: [{ required: true, message: intl.formatMessage({ id: 'select_country' }) }],
  //     },
  //     editable: true,
  //   },
  //   {
  //     title: intl.formatMessage({ id: 'exchange_rate' }),
  //     dataIndex: 'exchangeRate',
  //     formItemProps: {
  //       rules: [{ required: false, message: intl.formatMessage({ id: 'exchange_rate_required' }) }],
  //     },
  //     editable: true,
  //   },
  //   {
  //     title: intl.formatMessage({ id: 'service_fee' }),
  //     dataIndex: 'serviceFee',
  //     formItemProps: {
  //       rules: [{ required: false, message: intl.formatMessage({ id: 'service_fee_required' }) }],
  //     },
  //     editable: true,
  //   },
  //   {
  //     title: intl.formatMessage({ id: 'empty_package_fee' }),
  //     dataIndex: 'emptyPackageFee',
  //     formItemProps: {
  //       rules: [
  //         { required: false, message: intl.formatMessage({ id: 'empty_package_fee_required' }) },
  //       ],
  //     },
  //     editable: true,
  //   },
  //   {
  //     title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
  //     valueType: 'option',
  //     render: (text: any, record: any, _: any, action: any) => [
  //       <a
  //         key="editable"
  //         onClick={() => {
  //           action?.startEditable?.(`${record._id}`);
  //         }}
  //       >
  //         {intl.formatMessage({ id: 'edit' })}
  //       </a>,
  //     ],
  //   },
  // ];
  return (
    <ProForm
      initialValues={{ ...values }}
      form={form}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          // priceList: priceList.map(({ _id, ...rest }) => rest),
        });
        // form.resetFields();
      }}
    >
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_name' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'name' })}
          name="name"
        />
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_email' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'email' })}
          name="email"
        />
        <ProFormText
          rules={[{ required: newRecord, message: intl.formatMessage({ id: 'enter_password' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'password' })}
          name="password"
        />
        {access.canCustomerService && (
          <ProFormSelect
            name="role"
            width="md"
            label={intl.formatMessage({ id: 'role' })}
            valueEnum={
              access.isCustomerService
                ? {
                    CUSTOMER: intl.formatMessage({ id: 'CUSTOMER' }),
                  }
                : access.isSuperAdmin
                ? {
                    SUPER_ADMIN: intl.formatMessage({ id: 'SUPER_ADMIN' }),
                    ADMIN: intl.formatMessage({ id: 'ADMIN' }),
                    CUSTOMER: intl.formatMessage({ id: 'CUSTOMER' }),
                    ORDER_PLACER: intl.formatMessage({ id: 'ORDER_PLACER' }),
                    REVIEWER: intl.formatMessage({ id: 'REVIEWER' }),
                    CUSTOMER_SERVICE: intl.formatMessage({ id: 'CUSTOMER_SERVICE' }),
                  }
                : {
                    ADMIN: intl.formatMessage({ id: 'ADMIN' }),
                    CUSTOMER: intl.formatMessage({ id: 'CUSTOMER' }),
                    ORDER_PLACER: intl.formatMessage({ id: 'ORDER_PLACER' }),
                    REVIEWER: intl.formatMessage({ id: 'REVIEWER' }),
                    CUSTOMER_SERVICE: intl.formatMessage({ id: 'CUSTOMER_SERVICE' }),
                  }
            }
          />
        )}
      </ProForm.Group>

      {/* <EditableProTable<PriceListItem>
        rowKey="_id"
        headerTitle={intl.formatMessage({ id: 'price_list' })}
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
            emptyPackageFee: 0,
            country: '',
            platform: '',
          }),
        }}
      /> */}
      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
