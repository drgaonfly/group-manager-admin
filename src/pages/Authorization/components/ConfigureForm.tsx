import React, { useState, useEffect, useMemo } from 'react';
import {
  ModalForm,
  ProFormTextArea,
  ProDescriptions,
  ProFormGroup,
  ProFormText,
  ProFormDigit,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Form, Input, Tabs } from 'antd';
import { useAccess, useIntl, useModel } from '@umijs/max';
import { UploadFile } from 'antd/es/upload/interface';
import Upload from '@/components/Upload';
import useQueryList from '@/hooks/useQueryList';
import KeyboardTab from './BotConfigManager/Keyboard';
import SuccessTab from './BotConfigManager/Success';

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
  const [menus, setmenu] = useState<menuItem[]>([]);
  const [multiImageUrl, setMultiImageUrl] = useState<string>('');
  const { items: groups, loading: groupsLoading } = useQueryList('/groups');

  console.log('groups', groups);

  // 只提取需要的字段，避免渲染大数据导致卡顿
  const safeValues = useMemo(() => {
    if (!values) return {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { botUsers, botUserConfigs, groups, authorized_users, channel_posts, owners, ...rest } =
      values;
    return rest;
  }, [values?._id]);

  useEffect(() => {
    if (updateModalOpen && values) {
      form.setFieldsValue({
        ...safeValues,
      });

      setmenu(values?.menus || []);
      setMultiImageUrl(values?.multi_image || '');
    }
  }, [updateModalOpen, values?._id]);

  // const columns = [
  //   {
  //     title: intl.formatMessage({ id: 'name', defaultMessage: '按钮' }),
  //     dataIndex: 'name',
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
      width="70%"
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
        });
      }}
      initialValues={{
        ...safeValues,
        presets: values?.presets?.map((item: any) => item._id),
        menus: values?.menus?.map((item: any) => item._id),
      }}
    >
      <Tabs
        defaultActiveKey="basic"
        items={[
          {
            key: 'basic',
            label: intl.formatMessage({ id: 'basic_info', defaultMessage: '基本信息' }),
            children: (
              <>
                {safeValues && (
                  <ProDescriptions<API.ItemData>
                    column={2}
                    title={intl.formatMessage({ id: 'userDetails', defaultMessage: '用户详情' })}
                    request={async () => ({
                      data: {
                        ...safeValues,
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
                <ProFormGroup>
                  <ProFormTextArea
                    rules={[{ message: intl.formatMessage({ id: 'enter_name' }) }]}
                    width="md"
                    label={intl.formatMessage({ id: 'start_message', defaultMessage: '开始消息' })}
                    name="message"
                    fieldProps={{ autoSize: { minRows: 8 } }}
                  />
                  <ProFormTextArea
                    rules={[{ message: intl.formatMessage({ id: 'enter_contact' }) }]}
                    width="md"
                    label={intl.formatMessage({
                      id: 'contact_message',
                      defaultMessage: '联系客服信息',
                    })}
                    name="contact"
                    fieldProps={{ autoSize: { minRows: 8 } }}
                  />
                  <ProFormTextArea
                    rules={[{ message: intl.formatMessage({ id: 'enter_help' }) }]}
                    width="md"
                    label={intl.formatMessage({ id: 'help_message', defaultMessage: '帮助信息' })}
                    name="help"
                    fieldProps={{ autoSize: { minRows: 8 } }}
                  />
                  <ProFormText
                    rules={[
                      { required: false, message: intl.formatMessage({ id: 'enter_trx_address' }) },
                    ]}
                    width="md"
                    label={intl.formatMessage({
                      id: 'trx20_address',
                      defaultMessage: 'trx20_address地址',
                    })}
                    name="trx20_address"
                    tooltip="格式示例: T..."
                    placeholder="请输入trx地址"
                  />
                  {access.canSuperAdmin && (
                    <ProFormText
                      rules={[
                        { message: intl.formatMessage({ id: 'enter_customer_service_link' }) },
                      ]}
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
                  <ProFormSelect
                    width="md"
                    label={intl.formatMessage({ id: 'post_source', defaultMessage: '新闻源频道' })}
                    name="post_source"
                    tooltip="选择作为新闻源的频道群组"
                    showSearch
                    options={groups
                      .filter((g: any) => g.type === 'channel')
                      .map((g: any) => ({
                        label: g.title,
                        value: g._id,
                      }))}
                    fieldProps={{ loading: groupsLoading }}
                  />
                  <ProFormDigit
                    width="md"
                    label={intl.formatMessage({
                      id: 'balance_cleared_at',
                      defaultMessage: '每月清零日期',
                    })}
                    name="balanceClearedAt"
                    tooltip="每月几号自动清零所有用户的积分余额"
                    placeholder="请输入每月清零日期"
                    min={1}
                    max={31}
                    fieldProps={{ precision: 0, addonAfter: '号' }}
                    rules={[
                      {
                        required: false,
                        validator: async (_rule: any, value: any) => {
                          if (value && (value < 1 || value > 31)) {
                            throw new Error(intl.formatMessage({ id: 'balance_cleared_at_error' }));
                          }
                        },
                      },
                    ]}
                  />
                </ProFormGroup>
                <Form.Item
                  label={intl.formatMessage({ id: 'multi_image', defaultMessage: 'Multi Image' })}
                >
                  <Upload
                    onFileUpload={(url: string) => setMultiImageUrl(url)}
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
                <Form.Item name="_id" label={false}>
                  <Input type="hidden" />
                </Form.Item>
              </>
            ),
          },
          {
            key: 'keyboard',
            label: intl.formatMessage({ id: 'free_keyboard', defaultMessage: '自由键盘' }),
            children: (
              <KeyboardTab
                currentRow={values}
                onBotUpdate={async (updated) => {
                  await onSubmit({ ...values, ...updated });
                }}
              />
            ),
          },
          {
            key: 'success',
            label: intl.formatMessage({ id: 'success', defaultMessage: '积分继承' }),
            children: <SuccessTab currentRow={values} />,
          },
        ]}
      />
    </ModalForm>
  );
};

export default ConfigureForm;
