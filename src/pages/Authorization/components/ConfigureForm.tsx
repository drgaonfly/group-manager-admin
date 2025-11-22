import React, { useState, useEffect } from 'react';
import {
  ProTable,
  ModalForm,
  ProFormTextArea,
  ProDescriptions,
  ProFormGroup,
  ProFormText,
  type ProColumns,
  // ProFormDigit,
  // ProFormSwitch,
} from '@ant-design/pro-components';
import { Form, Input, Button } from 'antd';
import { FormattedMessage, useIntl, useModel } from '@umijs/max';
import { UploadFile } from 'antd/es/upload/interface';
import Upload from '@/components/Upload';
import KeyboardButtonsModal from './KeyboardButtonsModal';
import { PlusOutlined } from '@ant-design/icons';

type menuItem = {
  _id: string;
};

type keyboardButton = {
  _id: string;
  label: string;
  command: string;
  content: string;
};

type keyboardRow = {
  _id: string;
  row: number;
  buttons: keyboardButton[];
};

type presetItem = {
  _id: string;
  keyword: string;
  response: string;
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
  const [form] = Form.useForm();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [menus, setmenu] = useState<menuItem[]>(values?.menus || []);
  const [keyboardRows, setKeyboardRows] = useState<keyboardRow[]>([]);
  const [multiImageUrl, setMultiImageUrl] = useState<string>(values?.multi_image || '');
  const [presets, setPresets] = useState<presetItem[]>(values?.presets || []);

  useEffect(() => {
    if (updateModalOpen) {
      form.setFieldsValue({
        ...values,
      });

      // 将扁平的 keyboards 数据转换为按行分组的结构
      const keyboards = values?.keyboards || [];
      const processedKeyboards = keyboards.map((kb: any, index: number) => ({
        ...kb,
        row: kb.row || Math.floor(index / 2) + 1,
        label: kb.label || kb.command,
      }));

      // 按行号分组
      const groupedByRow: { [key: number]: keyboardButton[] } = {};
      processedKeyboards.forEach((kb: any) => {
        const rowNum = kb.row || 1;
        if (!groupedByRow[rowNum]) {
          groupedByRow[rowNum] = [];
        }
        groupedByRow[rowNum].push({
          _id: kb._id || Date.now().toString() + Math.random(),
          label: kb.label,
          command: kb.command,
          content: kb.content,
        });
      });

      // 转换为行数组
      const rows: keyboardRow[] = Object.keys(groupedByRow)
        .sort((a, b) => Number(a) - Number(b))
        .map((rowKey) => ({
          _id: `row_${rowKey}`,
          row: Number(rowKey),
          buttons: groupedByRow[Number(rowKey)],
        }));

      setKeyboardRows(rows);
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

  // 按钮编辑弹窗状态
  const [editingRow, setEditingRow] = useState<keyboardRow | null>(null);
  const [buttonModalOpen, setButtonModalOpen] = useState(false);

  const keyboard_row_columns: ProColumns<keyboardRow>[] = [
    {
      title: intl.formatMessage({ id: 'row', defaultMessage: '行号' }),
      dataIndex: 'row',
      valueType: 'digit',
      width: 80,
      editable: false,
      render: (_: any, record: keyboardRow) => `第 ${record.row} 行`,
    },
    {
      title: intl.formatMessage({ id: 'buttons', defaultMessage: '按钮列表' }),
      dataIndex: 'buttons',
      editable: false,
      render: (_: any, record: keyboardRow) => {
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {record.buttons && record.buttons.length > 0 ? (
              record.buttons.map((btn: keyboardButton) => (
                <span
                  key={btn._id}
                  style={{
                    padding: '4px 12px',
                    background: '#f0f0f0',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {btn.label || btn.command}
                </span>
              ))
            ) : (
              <span style={{ color: '#999' }}>暂无按钮</span>
            )}
          </div>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      valueType: 'option',
      width: 150,
      render: (_: any, record: keyboardRow) => [
        <a
          key="edit"
          onClick={() => {
            setEditingRow(record);
            setButtonModalOpen(true);
          }}
        >
          {intl.formatMessage({ id: 'edit_buttons', defaultMessage: '编辑按钮' })}
        </a>,
        <a
          key="delete"
          style={{ marginLeft: 8, color: 'red' }}
          onClick={() => {
            const newRows = keyboardRows.filter((row) => row._id !== record._id);
            setKeyboardRows(newRows);
          }}
        >
          {intl.formatMessage({ id: 'delete', defaultMessage: '删除' })}
        </a>,
      ],
    },
  ];

  // const preset_columns: ProColumns<presetItem>[] = [
  //   {
  //     title: intl.formatMessage({ id: 'keyword', defaultMessage: '关键词' }),
  //     dataIndex: 'keyword',
  //     formItemProps: {
  //       rules: [
  //         {
  //           required: true,
  //           message: intl.formatMessage({ id: 'keyword_required', defaultMessage: '请输入关键词' }),
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     title: intl.formatMessage({ id: 'response', defaultMessage: '回复内容' }),
  //     dataIndex: 'response',
  //     valueType: 'textarea' as const,
  //     formItemProps: {
  //       rules: [
  //         {
  //           required: true,
  //           message: intl.formatMessage({
  //             id: 'response_required',
  //             defaultMessage: '请输入回复内容',
  //           }),
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
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

        // 将分组的行数据转换回扁平的 keyboards 数组
        const flatKeyboards = keyboardRows.flatMap((row) =>
          row.buttons.map((btn) => ({
            row: row.row,
            label: btn.label || btn.command,
            command: btn.command,
            content: btn.content,
          })),
        );

        await onSubmit({
          ...values,
          ...formValues,
          multi_image: multiImageUrl,
          keyboards: flatKeyboards,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          menus: menus.map(({ _id, ...rest }) => rest),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          presets: presets.map(({ _id, ...rest }) => rest),
        });
      }}
      initialValues={{
        ...values,
        presets: values?.presets?.map((item: any) => item._id),
        keyboards: values?.keyboards?.map((item: any) => item._id),
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
              autoSize: { minRows: 6 },
            }}
          />
          <ProFormTextArea
            rules={[{ message: intl.formatMessage({ id: 'enter_contact' }) }]}
            width="md"
            label={intl.formatMessage({ id: 'contact_message', defaultMessage: '联系客服信息' })}
            name="contact"
            fieldProps={{
              autoSize: { minRows: 6 },
            }}
          />
          <ProFormText
            rules={[{ message: intl.formatMessage({ id: 'enter_customer_service_link' }) }]}
            width="md"
            label={intl.formatMessage({ id: 'customer_service_link', defaultMessage: '客服链接' })}
            name="customer_service_link"
            tooltip="格式示例: https://t.me/xxxx"
            placeholder="https://t.me/"
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
        </ProFormGroup>

        <ProFormGroup>
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
        </ProFormGroup>

        {/* <EditableProTable<presetItem>
          rowKey="_id"
          headerTitle={intl.formatMessage({
            id: 'preset_config',
            defaultMessage: '关键词自动回复配置',
          })}
          columns={preset_columns}
          value={presets}
          onChange={(value: readonly presetItem[]) => setPresets([...value])}
          editable={{
            type: 'multiple',
          }}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            position: 'bottom',
            record: () => ({
              _id: Date.now().toString(),
              keyword: '',
              response: '',
            }),
          }}
        /> */}

        <ProTable<keyboardRow>
          rowKey="_id"
          headerTitle={intl.formatMessage({
            id: 'keyboard_config',
            defaultMessage: '键盘配置',
          })}
          tooltip={intl.formatMessage({
            id: 'keyboard_config_tooltip',
            defaultMessage: '每一行可以包含多个按钮。点击"编辑按钮"可以管理该行的按钮。',
          })}
          // @ts-ignore
          columns={keyboard_row_columns}
          dataSource={keyboardRows}
          search={false}
          pagination={false}
          toolBarRender={() => [
            <Button
              key="button"
              icon={<PlusOutlined />}
              onClick={() => {
                const newRow: keyboardRow = {
                  _id: `row_${Date.now()}`,
                  row:
                    keyboardRows.length > 0 ? Math.max(...keyboardRows.map((r) => r.row)) + 1 : 1,
                  buttons: [],
                };
                setKeyboardRows([...keyboardRows, newRow]);
              }}
              type="primary"
            >
              {intl.formatMessage({
                id: 'add_keyboard_row',
                defaultMessage: '添加新行',
              })}
            </Button>,
          ]}
        />

        {/* 按钮编辑弹窗 */}
        <KeyboardButtonsModal
          open={buttonModalOpen}
          onOpenChange={setButtonModalOpen}
          editingRow={editingRow}
          onButtonsChange={(buttons) => {
            if (editingRow) {
              const newRows = keyboardRows.map((row) => {
                if (row._id === editingRow._id) {
                  return { ...row, buttons };
                }
                return row;
              });
              setKeyboardRows(newRows);
              setEditingRow({ ...editingRow, buttons });
            }
          }}
        />

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
