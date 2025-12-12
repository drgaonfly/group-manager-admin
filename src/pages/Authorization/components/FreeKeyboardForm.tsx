import React, { useState, useEffect } from 'react';
import { ProTable, ModalForm, ProColumns } from '@ant-design/pro-components';
import { Form, Input, Button } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import KeyboardButtonsModal from './KeyboardButtonsModal';
import { PlusOutlined, HolderOutlined } from '@ant-design/icons';
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

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<API.ItemData>;
};

const FreeKeyboardForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [keyboardRows, setKeyboardRows] = useState<keyboardRow[]>([]);

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
    }
  }, [updateModalOpen, values]);

  // 按钮编辑弹窗状态
  const [editingRow, setEditingRow] = useState<keyboardRow | null>(null);
  const [buttonModalOpen, setButtonModalOpen] = useState(false);

  // Row Context for drag handle
  interface RowContextValue {
    setActivatorNodeRef?: (element: HTMLElement | null) => void;
    listeners?: any;
    attributes?: any;
  }

  const RowContext = React.createContext<RowContextValue>({});

  // 拖拽传感器
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

  const handleRowDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = keyboardRows.findIndex((item) => item._id === active.id);
      const newIndex = keyboardRows.findIndex((item) => item._id === over.id);
      const newRows = arrayMove(keyboardRows, oldIndex, newIndex);
      // 重新计算行号
      const reordered = newRows.map((row, index) => ({ ...row, row: index + 1 }));
      setKeyboardRows(reordered);
    }
  };

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

  const keyboard_row_columns: ProColumns<keyboardRow>[] = [
    {
      title: <HolderOutlined />,
      dataIndex: 'sort',
      width: 60,
      render: () => <DragHandle />,
    },
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
            // 重新计算行号
            const reordered = newRows.map((row, idx) => ({ ...row, row: idx + 1 }));
            setKeyboardRows(reordered);
          }}
        >
          {intl.formatMessage({ id: 'delete', defaultMessage: '删除' })}
        </a>,
      ],
    },
  ];

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
          keyboards: flatKeyboards,
        });
      }}
      initialValues={{
        ...values,
        keyboards: values?.keyboards?.map((item: any) => item._id),
      }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRowDragEnd}>
        <SortableContext
          items={keyboardRows.map((item) => item._id)}
          strategy={verticalListSortingStrategy}
        >
          <ProTable<keyboardRow>
            rowKey="_id"
            headerTitle={intl.formatMessage({
              id: 'keyboard_config',
              defaultMessage: '键盘配置',
            })}
            tooltip={intl.formatMessage({
              id: 'keyboard_config_tooltip',
              defaultMessage: '每一行可以包含多个按钮。拖动排序图标可调整行的顺序。',
            })}
            // @ts-ignore
            columns={keyboard_row_columns}
            dataSource={keyboardRows}
            search={false}
            pagination={false}
            components={{
              body: {
                row: SortableRow,
              },
            }}
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
        </SortableContext>
      </DndContext>

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

      <Form.Item name="_id" label={false}>
        <Input type="hidden" />
      </Form.Item>
    </ModalForm>
  );
};

export default FreeKeyboardForm;
