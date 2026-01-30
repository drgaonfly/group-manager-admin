import React from 'react';
import { ModalForm, type ProColumns } from '@ant-design/pro-components';
import { Table, Button, Form, Input, Space } from 'antd';
import { useIntl } from '@umijs/max';
import { HolderOutlined, PlusOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface KeyboardButtonsFormProps {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  editingRow: keyboardRow | null;
  onButtonsChange: (buttons: keyboardButton[]) => void;
}

interface RowContextValue {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: any;
  attributes?: any;
}

const RowContext = React.createContext<RowContextValue>({});

// 可拖拽的行组件
const SortableRow = (props: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative' as const, zIndex: 9999, opacity: 0.5 } : {}),
  };

  return (
    <RowContext.Provider value={{ setActivatorNodeRef, listeners, attributes }}>
      <tr {...props} ref={setNodeRef} style={style} />
    </RowContext.Provider>
  );
};

// 拖拽手柄组件
const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners, attributes } = React.useContext(RowContext);

  return (
    <div
      ref={setActivatorNodeRef}
      {...listeners}
      {...attributes}
      style={{
        cursor: 'grab',
        padding: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        touchAction: 'none',
      }}
    >
      <HolderOutlined style={{ fontSize: 16, color: '#999' }} />
    </div>
  );
};

const KeyboardButtonsForm: React.FC<KeyboardButtonsFormProps> = ({
  open,
  onOpenChange,
  editingRow,
  onButtonsChange,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = React.useState('');
  const buttons = editingRow?.buttons || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = buttons.findIndex((item) => item._id === active.id);
      const newIndex = buttons.findIndex((item) => item._id === over.id);
      const newButtons = arrayMove(buttons, oldIndex, newIndex);
      onButtonsChange(newButtons);
    }
  };

  const isEditing = (record: keyboardButton) => record._id === editingKey;

  const edit = (record: keyboardButton) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record._id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (id: string) => {
    try {
      const row = await form.validateFields();
      const newData = [...buttons];
      const index = newData.findIndex((item) => id === item._id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        onButtonsChange(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const deleteButton = (id: string) => {
    const newButtons = buttons.filter((item) => item._id !== id);
    onButtonsChange(newButtons);
  };

  const addButton = () => {
    const newButton: keyboardButton = {
      _id: Date.now().toString() + Math.random(),
      label: '',
      command: '',
      content: '',
    };
    onButtonsChange([...buttons, newButton]);
    setEditingKey(newButton._id);
    form.setFieldsValue(newButton);
  };

  const columns: ProColumns<keyboardButton>[] = [
    {
      title: <HolderOutlined />,
      dataIndex: 'sort',
      width: 60,
      render: () => <DragHandle />,
    },
    {
      title: intl.formatMessage({ id: 'label', defaultMessage: '按钮文本' }),
      dataIndex: 'label',
      width: 150,
      render: (_: any, record: keyboardButton) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="label"
              style={{ margin: 0 }}
              rules={[
                {
                  required: false,
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'label_placeholder',
                  defaultMessage: '不填则使用命令',
                })}
              />
            </Form.Item>
          );
        }
        return record.label || <span style={{ color: '#999' }}>-</span>;
      },
    },
    {
      title: intl.formatMessage({ id: 'command', defaultMessage: '命令' }),
      dataIndex: 'command',
      width: 150,
      render: (_: any, record: keyboardButton) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="command"
              style={{ margin: 0 }}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'command_required',
                    defaultMessage: '请输入命令',
                  }),
                },
              ]}
            >
              <Input />
            </Form.Item>
          );
        }
        return record.command;
      },
    },
    {
      title: intl.formatMessage({ id: 'content', defaultMessage: '响应内容' }),
      dataIndex: 'content',
      render: (_: any, record: keyboardButton) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="content"
              style={{ margin: 0 }}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'content_required',
                    defaultMessage: '请输入响应内容',
                  }),
                },
              ]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          );
        }
        return record.content;
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.searchTable.titleOption',
        defaultMessage: '操作',
      }),
      dataIndex: 'operation',
      width: 150,
      render: (_: any, record: keyboardButton) => {
        const editable = isEditing(record);
        const isDisabled = editingKey !== '' && !editable;
        return editable ? (
          <Space>
            <a onClick={() => save(record._id)}>保存</a>
            <a onClick={cancel}>取消</a>
          </Space>
        ) : (
          <Space>
            <a
              onClick={() => !isDisabled && edit(record)}
              style={{
                color: isDisabled ? '#ccc' : undefined,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              编辑
            </a>
            <a onClick={() => deleteButton(record._id)} style={{ color: 'red' }}>
              删除
            </a>
          </Space>
        );
      },
    },
  ];

  return (
    <ModalForm
      title={intl.formatMessage(
        { id: 'edit_row_buttons', defaultMessage: '编辑第 {row} 行的按钮' },
        { row: editingRow?.row || '' },
      )}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) {
          setEditingKey('');
          form.resetFields();
        }
        onOpenChange(visible);
      }}
      width={900}
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={async () => {
        if (editingKey) {
          await save(editingKey);
        }
        onOpenChange(false);
        return true;
      }}
    >
      <Form form={form} component={false}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={buttons.map((item) => item._id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              components={{
                body: {
                  row: SortableRow,
                },
              }}
              rowKey="_id"
              columns={columns as any}
              dataSource={buttons}
              pagination={false}
              size="small"
            />
          </SortableContext>
        </DndContext>
      </Form>
      <Button
        type="dashed"
        onClick={addButton}
        icon={<PlusOutlined />}
        style={{ width: '100%', marginTop: 16 }}
      >
        {intl.formatMessage({
          id: 'add_button',
          defaultMessage: '添加按钮',
        })}
      </Button>
    </ModalForm>
  );
};

export default KeyboardButtonsForm;
