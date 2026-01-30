import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import KeyboardButtonsForm from './KeyboardButtonsForm';
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

type KeyboardButton = {
  _id: string;
  label: string;
  command: string;
  content: string;
};

type KeyboardRow = {
  _id: string;
  row: number;
  buttons: KeyboardButton[];
};

export interface KeyboardEditorProps {
  value?: any[];
  onChange?: (keyboards: any[]) => void;
}

export interface KeyboardEditorRef {
  getKeyboards: () => any[];
}

const KeyboardEditor = forwardRef<KeyboardEditorRef, KeyboardEditorProps>(
  ({ value = [], onChange }, ref) => {
    const intl = useIntl();
    const [keyboardRows, setKeyboardRows] = useState<KeyboardRow[]>([]);
    const [editingRow, setEditingRow] = useState<KeyboardRow | null>(null);
    const [buttonModalOpen, setButtonModalOpen] = useState(false);

    // 初始化数据
    useEffect(() => {
      const keyboards = value || [];
      const processedKeyboards = keyboards.map((kb: any, index: number) => ({
        ...kb,
        row: kb.row || Math.floor(index / 2) + 1,
        label: kb.label || kb.command,
      }));

      const groupedByRow: { [key: number]: KeyboardButton[] } = {};
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

      const rows: KeyboardRow[] = Object.keys(groupedByRow)
        .sort((a, b) => Number(a) - Number(b))
        .map((rowKey) => ({
          _id: `row_${rowKey}`,
          row: Number(rowKey),
          buttons: groupedByRow[Number(rowKey)],
        }));

      setKeyboardRows(rows);
    }, [value]);

    // 转换为扁平数组
    const getFlatKeyboards = () => {
      return keyboardRows.flatMap((row) =>
        row.buttons.map((btn) => ({
          row: row.row,
          label: btn.label || btn.command,
          command: btn.command,
          content: btn.content,
        })),
      );
    };

    // 暴露方法
    useImperativeHandle(ref, () => ({
      getKeyboards: getFlatKeyboards,
    }));

    // 通知变化
    const notifyChange = (rows: KeyboardRow[]) => {
      setKeyboardRows(rows);
      if (onChange) {
        const flat = rows.flatMap((row) =>
          row.buttons.map((btn) => ({
            row: row.row,
            label: btn.label || btn.command,
            command: btn.command,
            content: btn.content,
          })),
        );
        onChange(flat);
      }
    };

    // Row Context
    interface RowContextValue {
      setActivatorNodeRef?: (element: HTMLElement | null) => void;
      listeners?: any;
      attributes?: any;
    }
    const RowContext = React.createContext<RowContextValue>({});

    // 拖拽传感器
    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleRowDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = keyboardRows.findIndex((item) => item._id === active.id);
        const newIndex = keyboardRows.findIndex((item) => item._id === over.id);
        const newRows = arrayMove(keyboardRows, oldIndex, newIndex);
        const reordered = newRows.map((row, index) => ({ ...row, row: index + 1 }));
        notifyChange(reordered);
      }
    };

    // 可拖拽行
    const SortableRow = (props: any) => {
      const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
      } = useSortable({ id: props['data-row-key'] });

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

    // 拖拽手柄
    const DragHandle: React.FC = () => {
      const { setActivatorNodeRef, listeners, attributes } = React.useContext(RowContext);
      return (
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          style={{ cursor: 'grab', padding: '8px', display: 'inline-flex', touchAction: 'none' }}
        >
          <HolderOutlined style={{ fontSize: 16, color: '#999' }} />
        </div>
      );
    };

    const columns: ProColumns<KeyboardRow>[] = [
      {
        title: <HolderOutlined />,
        dataIndex: 'sort',
        width: 60,
        render: () => <DragHandle />,
      },
      {
        title: intl.formatMessage({ id: 'row', defaultMessage: '行号' }),
        dataIndex: 'row',
        width: 80,
        render: (_: any, record: KeyboardRow) => `第 ${record.row} 行`,
      },
      {
        title: intl.formatMessage({ id: 'buttons', defaultMessage: '按钮列表' }),
        dataIndex: 'buttons',
        render: (_: any, record: KeyboardRow) => (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {record.buttons?.length > 0 ? (
              record.buttons.map((btn) => (
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
        ),
      },
      {
        title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
        valueType: 'option',
        width: 150,
        render: (_: any, record: KeyboardRow) => [
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
              const reordered = newRows.map((row, idx) => ({ ...row, row: idx + 1 }));
              notifyChange(reordered);
            }}
          >
            {intl.formatMessage({ id: 'delete', defaultMessage: '删除' })}
          </a>,
        ],
      },
    ];

    return (
      <div>
        {/* 自定义工具栏 - 在表格上方左侧 */}
        <div style={{ marginBottom: 16 }}>
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              const newRow: KeyboardRow = {
                _id: `row_${Date.now()}`,
                row: keyboardRows.length > 0 ? Math.max(...keyboardRows.map((r) => r.row)) + 1 : 1,
                buttons: [],
              };
              notifyChange([...keyboardRows, newRow]);
            }}
            type="primary"
          >
            {intl.formatMessage({ id: 'add_keyboard_row', defaultMessage: '添加新行' })}
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleRowDragEnd}
        >
          <SortableContext
            items={keyboardRows.map((item) => item._id)}
            strategy={verticalListSortingStrategy}
          >
            <ProTable<KeyboardRow>
              rowKey="_id"
              columns={columns}
              dataSource={keyboardRows}
              search={false}
              pagination={false}
              options={false}
              components={{ body: { row: SortableRow } }}
            />
          </SortableContext>
        </DndContext>

        <KeyboardButtonsForm
          open={buttonModalOpen}
          onOpenChange={setButtonModalOpen}
          editingRow={editingRow}
          onButtonsChange={(buttons) => {
            if (editingRow) {
              const newRows = keyboardRows.map((row) =>
                row._id === editingRow._id ? { ...row, buttons } : row,
              );
              notifyChange(newRows);
              setEditingRow({ ...editingRow, buttons });
            }
          }}
        />
      </div>
    );
  },
);

KeyboardEditor.displayName = 'KeyboardEditor';

export default KeyboardEditor;
