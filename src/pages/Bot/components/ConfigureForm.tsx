import React, { useState } from 'react';
import { EditableProTable, ModalForm, ProFormText } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';

type PriceListItem = {
  _id: string;
};

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    priceList?: any;
  } & Partial<API.ItemData>;
};

const ConfigureForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [priceList, setPriceList] = useState<PriceListItem[]>(values?.priceList || []);
  console.log('values', values);
  const columns = [
    {
      title: intl.formatMessage({ id: 'menuName', defaultMessage: '菜单名' }),
      dataIndex: 'menuName',
      hideInSearch: false,
      width: 200,
    },
    {
      title: intl.formatMessage({ id: 'url', defaultMessage: '菜单链接' }),
      dataIndex: 'url',
      hideInSearch: false,
      copyable: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      valueType: 'option',
      width: 200,
      render: (text: any, record: any, _: any, action: any) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(`${record._id}`);
          }}
        >
          {intl.formatMessage({ id: 'edit' })}
        </a>,
      ],
    },
  ];
  return (
    <ModalForm
      title={intl.formatMessage({ id: 'configure', defaultMessage: 'Configure' })}
      width="60%"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={updateModalOpen}
      onOpenChange={onCancel}
      onFinish={async (values: any) => {
        await onSubmit({
          ...values,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          priceList: priceList.map(({ _id, ...rest }) => rest),
        });
      }}
      initialValues={{ ...values }}
    >
      <>
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_name' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'user_name' })}
          name="name"
          disabled
        />
        <EditableProTable<PriceListItem>
          rowKey="_id"
          headerTitle={intl.formatMessage({ id: 'price_list' })}
          // @ts-ignore
          columns={columns}
          value={priceList}
          name="priceList"
          onChange={(value: readonly PriceListItem[]) => setPriceList([...value])}
          editable={{
            type: 'multiple',
          }}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            position: 'bottom',
            record: () => ({
              _id: Date.now().toString(),
              months: 0,
              price: 0,
              originalPrice: 0,
              isOnline: false,
              isCarSeat: false,
              isExclusive: false,
              exclusivePrice: 0,
              exclusiveOriginalPrice: 0,
              seatCount: 0,
              user: values.user,
              token: values.token,
              name: values.name,
              userName: values.userName,
            }),
          }}
        />

        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      </>
    </ModalForm>
  );
};

export default ConfigureForm;
