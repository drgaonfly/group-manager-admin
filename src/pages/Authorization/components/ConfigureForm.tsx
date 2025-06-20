import React, { useState } from 'react';
import {
  EditableProTable,
  ModalForm,
  ProFormTextArea,
  ProDescriptions,
  ProFormGroup,
  ProFormText,
  ProFormDigit,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import { FormattedMessage, useIntl, useModel } from '@umijs/max';

type menuItem = {
  _id: string;
};

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    menus?: any;
    user?: any;
  } & Partial<API.ItemData>;
};

const ConfigureForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [menus, setmenu] = useState<menuItem[]>(values?.menus || []);
  console.log('values', values);
  const columns = [
    {
      title: intl.formatMessage({ id: 'menuName', defaultMessage: '按钮' }),
      dataIndex: 'menuName',
      hideInSearch: false,
      width: 200,
    },
    {
      title: intl.formatMessage({ id: 'url', defaultMessage: '菜单链接' }),
      dataIndex: 'url',
      hideInSearch: false,
      copyable: true,
      initialValue: process.env.UMI_APP_MENU_URL,
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
          menus: menus.map(({ _id, ...rest }) => rest),
        });
      }}
      initialValues={{ ...values }}
    >
      {values && (
        <ProDescriptions<API.ItemData>
          column={2}
          title={intl.formatMessage({ id: 'userDetails', defaultMessage: '用户详情' })}
          request={async () => ({
            data: {
              ...values,
              inviteCode: (currentUser as any)?.inviteCode || '',
            },
          })}
          columns={[
            {
              title: intl.formatMessage({ id: 'token', defaultMessage: 'token' }),
              dataIndex: 'token',
              copyable: true,
            },
            {
              title: intl.formatMessage({ id: 'botName', defaultMessage: '机器人名称' }),
              dataIndex: 'botName',
              copyable: true,
            },
            // 可以根据需要添加更多字段
          ]}
          bordered
          labelStyle={{
            width: '10%',
            justifyContent: 'flex-end',
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
          }}
          contentStyle={{
            width: '50%',
            padding: '8px 16px',
          }}
          size="small"
          style={{ marginTop: '20px', marginBottom: '10px' }}
        />
      )}
      <>
        <ProFormGroup>
          <ProFormTextArea
            rules={[{ message: intl.formatMessage({ id: 'enter_name' }) }]}
            width="md"
            label={intl.formatMessage({ id: 'start_message', defaultMessage: '开始消息' })}
            name="message"
          />
          <ProFormTextArea
            rules={[{ message: intl.formatMessage({ id: 'enter_contact' }) }]}
            width="md"
            label={intl.formatMessage({ id: 'contact_message', defaultMessage: '联系客服信息' })}
            name="contact"
          />
          <ProFormText
            rules={[{ message: intl.formatMessage({ id: 'enter_customer_service_link' }) }]}
            width="md"
            label={intl.formatMessage({ id: 'customer_service_link', defaultMessage: '客服链接' })}
            name="customer_service_link"
            tooltip="格式示例: https://t.me/xxxx"
            placeholder="https://t.me/"
          />
          <ProFormText
            rules={[{ message: intl.formatMessage({ id: 'enter_auto_exchange_address' }) }]}
            width="md"
            label={intl.formatMessage({
              id: 'auto_exchange_address',
              defaultMessage: '自动闪兑地址',
            })}
            name="auto_exchange_address"
            tooltip="格式示例: T..."
            placeholder="请输入trx地址"
          />
          <ProFormDigit
            width="md"
            label={intl.formatMessage({ id: 'fee', defaultMessage: '闪兑费用' })}
            name="fee"
            tooltip="闪兑费用，单位：%"
            placeholder="请输入闪兑费用百分比"
            min={0}
            max={100}
            fieldProps={{
              precision: 0,
              addonAfter: '%',
            }}
          />
          <ProFormText.Password
            rules={[{ message: intl.formatMessage({ id: 'enter_private_key' }) }]}
            width="md"
            label={intl.formatMessage({ id: 'private_key', defaultMessage: '私钥' })}
            name="private_key"
          />
          <ProFormSwitch
            name="canBeCloned"
            width="md"
            label={intl.formatMessage({ id: 'can_be_cloned', defaultMessage: '是否可克隆' })}
          />
        </ProFormGroup>
        <EditableProTable<menuItem>
          rowKey="_id"
          headerTitle={intl.formatMessage({
            id: 'inline_menu_config',
            defaultMessage: '内联菜单配置',
          })}
          // @ts-ignore
          columns={columns}
          value={menus}
          name="menus"
          onChange={(value: readonly menuItem[]) => setmenu([...value])}
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
              url: process.env.UMI_APP_MENU_URL,
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
