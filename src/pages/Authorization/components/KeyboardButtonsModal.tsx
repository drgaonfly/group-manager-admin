import React from 'react';
import { ModalForm, EditableProTable, type ProColumns } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';

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

interface KeyboardButtonsModalProps {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  editingRow: keyboardRow | null;
  onButtonsChange: (buttons: keyboardButton[]) => void;
}

const KeyboardButtonsModal: React.FC<KeyboardButtonsModalProps> = ({
  open,
  onOpenChange,
  editingRow,
  onButtonsChange,
}) => {
  const intl = useIntl();

  const getColumns = (
    onButtonsChange: (buttons: keyboardButton[]) => void,
    currentButtons: keyboardButton[],
  ): ProColumns<keyboardButton>[] => [
    {
      title: intl.formatMessage({ id: 'label', defaultMessage: '按钮文本' }),
      dataIndex: 'label',
      tooltip: intl.formatMessage({
        id: 'label_tooltip',
        defaultMessage: '不填写则使用命令作为显示文本',
      }),
      width: 120,
    },
    {
      title: intl.formatMessage({ id: 'command', defaultMessage: '命令' }),
      dataIndex: 'command',
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'command_required',
              defaultMessage: '请输入命令',
            }),
          },
        ],
      },
      width: 120,
    },
    {
      title: intl.formatMessage({ id: 'content', defaultMessage: '响应内容' }),
      dataIndex: 'content',
      valueType: 'textarea',
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'content_required',
              defaultMessage: '请输入响应内容',
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.searchTable.titleOption',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      width: 150,
      render: (_: any, record: keyboardButton, __: any, action: any) => [
        <a
          key="edit"
          onClick={() => {
            action?.startEditable?.(record._id);
          }}
        >
          {intl.formatMessage({ id: 'edit', defaultMessage: '编辑' })}
        </a>,
        <a
          key="delete"
          style={{ marginLeft: 8, color: 'red' }}
          onClick={() => {
            const newButtons = currentButtons.filter((btn) => btn._id !== record._id);
            onButtonsChange(newButtons);
          }}
        >
          {intl.formatMessage({ id: 'delete', defaultMessage: '删除' })}
        </a>,
      ],
    },
  ];

  return (
    <ModalForm
      title={intl.formatMessage(
        { id: 'edit_row_buttons', defaultMessage: '编辑第 {row} 行的按钮' },
        { row: editingRow?.row || '' },
      )}
      open={open}
      onOpenChange={onOpenChange}
      width={800}
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={async () => {
        onOpenChange(false);
        return true;
      }}
    >
      <EditableProTable<keyboardButton>
        rowKey="_id"
        columns={getColumns(onButtonsChange, editingRow?.buttons || [])}
        value={editingRow?.buttons || []}
        onChange={(buttons: readonly keyboardButton[]) => {
          onButtonsChange([...buttons]);
        }}
        recordCreatorProps={{
          position: 'bottom',
          record: () => ({
            _id: Date.now().toString() + Math.random(),
            label: '',
            command: '',
            content: '',
          }),
          creatorButtonText: intl.formatMessage({
            id: 'add_button',
            defaultMessage: '添加按钮',
          }),
        }}
        editable={{
          type: 'multiple',
        }}
      />
    </ModalForm>
  );
};

export default KeyboardButtonsModal;
