import React, { useState, useEffect } from 'react';
import {
  ModalForm,
  ProFormTextArea,
  ProDescriptions,
  ProFormGroup,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import { useAccess, useIntl, useModel } from '@umijs/max';
import { UploadFile } from 'antd/es/upload/interface';
import Upload from '@/components/Upload';
import PresetTableForm, { PresetItem } from './PresetTableForm';

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
  const access = useAccess();
  const [form] = Form.useForm();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [menus, setmenu] = useState<menuItem[]>(values?.menus || []);
  const [multiImageUrl, setMultiImageUrl] = useState<string>(values?.multi_image || '');
  const [presets, setPresets] = useState<PresetItem[]>(values?.presets || []);

  useEffect(() => {
    if (updateModalOpen) {
      form.setFieldsValue({
        ...values,
      });

      setPresets(values?.presets || []);
      setmenu(values?.menus || []);
      setMultiImageUrl(values?.multi_image || '');
    }
  }, [updateModalOpen, values]);

  console.log('values', values);

  // const columns = [
  //   {
  //     title: intl.formatMessage({ id: 'menuName', defaultMessage: '按钮' }),
  //     dataIndex: 'menuName',
  //     hideInSearch: false,
  //     width: 200,
  //   },
  //   {
  //     title: intl.formatMessage({ id: 'url', defaultMessage: '菜单链接' }),
  //     dataIndex: 'url',
  //     hideInSearch: false,
  //     copyable: true,
  //     initialValue: process.env.UMI_APP_MENU_URL,
  //   },
  //   {
  //     title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
  //     valueType: 'option',
  //     width: 200,
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
    <ModalForm
      form={form}
      title={intl.formatMessage({ id: 'configure', defaultMessage: 'Configure' })}
      width="60%"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={updateModalOpen}
      onOpenChange={onCancel}
      onFinish={async () => {
        const formValues = form.getFieldsValue();

        await onSubmit({
          ...values,
          ...formValues,
          multi_image: multiImageUrl,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          menus: menus.map(({ _id, ...rest }) => rest),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          presets: presets.map(({ _id, ...rest }) => rest),
        });
      }}
      initialValues={{
        ...values,
        presets: values?.presets?.map((item: any) => item._id),
        menus: values?.menus?.map((item: any) => item._id),
      }}
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
            fieldProps={{
              autoSize: { minRows: 8 },
            }}
          />
          <ProFormTextArea
            rules={[{ message: intl.formatMessage({ id: 'enter_contact' }) }]}
            width="md"
            label={intl.formatMessage({ id: 'contact_message', defaultMessage: '联系客服信息' })}
            name="contact"
            fieldProps={{
              autoSize: { minRows: 8 },
            }}
          />

          {/* <ProFormText
            rules={[{ required: false, message: intl.formatMessage({ id: 'enter_trx_address' }) }]}
            width="md"
            label={intl.formatMessage({
              id: 'trx20_address',
              defaultMessage: 'trx20_address地址',
            })}
            name="trx20_address"
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
          /> */}
          {/* <ProFormSwitch
            name="canBeCloned"
            width="md"
            label={intl.formatMessage({ id: 'can_be_cloned', defaultMessage: '是否可克隆' })}
          /> */}

          <Form.Item
            label={intl.formatMessage({ id: 'multi_image', defaultMessage: 'Multi Image' })}
          >
            <Upload
              onFileUpload={(url: string) => {
                setMultiImageUrl(url);
              }}
              accept=".jpg,.jpeg,.png,.gif"
              defaultFileList={
                multiImageUrl
                  ? [
                      {
                        uid: '1',
                        name: 'multi_image',
                        status: 'done' as UploadFile['status'],
                        url: multiImageUrl,
                      },
                    ]
                  : []
              }
              onRemove={() => {
                setMultiImageUrl('');
                return true;
              }}
            />
          </Form.Item>

          {access.canSuperAdmin && (
            <ProFormText
              rules={[{ message: intl.formatMessage({ id: 'enter_customer_service_link' }) }]}
              width="md"
              label={intl.formatMessage({
                id: 'customer_service_link',
                defaultMessage: '客服链接',
              })}
              name="customer_service_link"
              tooltip="格式示例: https://t.me/xxxx"
              placeholder="https://t.me/"
            />
          )}
        </ProFormGroup>

        <PresetTableForm value={presets} onChange={setPresets} />

        {/* <EditableProTable<menuItem>
          rowKey="_id"
          headerTitle={intl.formatMessage({
            id: 'inline_menu_config',
            defaultMessage: '内联菜单配置',
          })}
          // @ts-ignore
          columns={columns}
          value={menus}
          onChange={(value: readonly menuItem[]) => setmenu([...value])}
          editable={{
            type: 'multiple',
          }}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            position: 'bottom',
            record: () => ({
              _id: Date.now().toString(),
              menuName: ' ',
              url: '',
            }),
          }}
        /> */}
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      </>
    </ModalForm>
  );
};

export default ConfigureForm;
