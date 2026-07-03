import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, Tooltip, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';

export type MenuItemStyle = 'primary' | 'success' | 'danger';

export interface InlineMenuItem {
  _id: string;
  name: string;
  url: string;
  row: number;
  style?: MenuItemStyle;
}

// ─── 样式映射 ──────────────────────────────────────────────
const styleColorMap: Record<MenuItemStyle, { bg: string; border: string; text: string }> = {
  primary: { bg: '#e6f4ff', border: '#91caff', text: '#0958d9' },
  success: { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' },
  danger: { bg: '#fff2f0', border: '#ffccc7', text: '#cf1322' },
};

// ─── 按钮配置弹窗 ──────────────────────────────────────────
interface ButtonConfigModalProps {
  open: boolean;
  item: Partial<InlineMenuItem>;
  onOk: (values: Pick<InlineMenuItem, 'name' | 'url' | 'style'>) => void;
  onCancel: () => void;
  showStyle?: boolean;
}

const ButtonConfigModal: React.FC<ButtonConfigModalProps> = ({
  open,
  item,
  onOk,
  onCancel,
  showStyle = false,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: item.name || '',
        url: item.url || '',
        style: item.style || 'primary',
      });
    }
  }, [open, item]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
      form.resetFields();
    } catch (_) {}
  };

  return (
    <Modal
      title={item._id ? '编辑按钮' : '新建按钮'}
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      width={400}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="按钮名称"
          rules={[{ required: true, message: '请输入按钮名称' }]}
        >
          <Input placeholder="例如：点击领取" autoFocus />
        </Form.Item>
        <Form.Item
          name="url"
          label="按钮链接"
          rules={[
            { required: true, message: '请输入链接' },
            { pattern: /^https?:\/\/.+/, message: '请输入有效链接（https://...）' },
          ]}
        >
          <Input placeholder="https://t.me/..." />
        </Form.Item>
        {showStyle && (
          <Form.Item name="style" label="按钮样式">
            <Select
              options={[
                { label: '🔵 蓝色', value: 'primary' },
                { label: '🟢 绿色', value: 'success' },
                { label: '🔴 红色', value: 'danger' },
              ]}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

// ─── 主组件 ────────────────────────────────────────────────
interface InlineMenuEditorProps {
  value?: InlineMenuItem[];
  onChange?: (value: InlineMenuItem[]) => void;
  showStyle?: boolean;
}

const InlineMenuEditor: React.FC<InlineMenuEditorProps> = ({
  value = [],
  onChange,
  showStyle = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InlineMenuItem>>({});

  const triggerChange = (next: InlineMenuItem[]) => onChange?.(next);

  // 按 row 分组，升序排列
  // 空行也要显示（即使没有按钮）
  const existingRows = Array.from(new Set(value.map((m) => m.row))).sort((a, b) => a - b);
  const [emptyRows, setEmptyRows] = useState<number[]>([]);

  // 合并已有行和空行
  const allRows = Array.from(new Set([...existingRows, ...emptyRows])).sort((a, b) => a - b);

  const buttonsInRow = (row: number) => value.filter((m) => m.row === row);

  // 新建一行（取当前最大行号 +1，创建空行）
  const addRow = () => {
    const nextRow = allRows.length > 0 ? Math.max(...allRows) + 1 : 1;
    setEmptyRows((prev) => [...prev, nextRow]);
  };

  // 在指定行新建按钮
  const addButtonInRow = (row: number) => {
    setEditingItem({ row });
    setModalOpen(true);
  };

  // 编辑按钮
  const editButton = (item: InlineMenuItem) => {
    setEditingItem({ ...item });
    setModalOpen(true);
  };

  // 删除按钮
  const deleteButton = (id: string) => {
    triggerChange(value.filter((m) => m._id !== id));
  };

  // 删除整行
  const deleteRow = (row: number) => {
    triggerChange(value.filter((m) => m.row !== row));
    setEmptyRows((prev) => prev.filter((r) => r !== row));
  };

  // 弹窗确认
  const handleModalOk = (vals: Pick<InlineMenuItem, 'name' | 'url' | 'style'>) => {
    if (editingItem._id) {
      // 编辑已有按钮
      triggerChange(value.map((m) => (m._id === editingItem._id ? { ...m, ...vals } : m)));
    } else {
      // 新建按钮
      triggerChange([
        ...value,
        {
          _id: Date.now().toString(),
          row: editingItem.row ?? 1,
          ...vals,
          style: vals.style || 'primary',
        },
      ]);
      // 如果是从空行添加的，把该行从 emptyRows 移除
      setEmptyRows((prev) => prev.filter((r) => r !== editingItem.row));
    }
    setModalOpen(false);
  };

  return (
    <div>
      {/* 行列布局 */}
      <div
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          padding: '12px 16px',
          background: '#fafafa',
          marginBottom: 8,
          minHeight: 56,
        }}
      >
        {allRows.length === 0 ? (
          <span style={{ color: '#bfbfbf', fontSize: 13 }}>暂无按钮，点击「新建行」开始配置</span>
        ) : (
          allRows.map((row) => (
            <div
              key={row}
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 8,
                paddingBottom: 8,
                borderBottom: '1px dashed #e8e8e8',
              }}
            >
              {/* 行标签 */}
              <span
                style={{
                  fontSize: 11,
                  color: '#8c8c8c',
                  background: '#f0f0f0',
                  borderRadius: 3,
                  padding: '1px 5px',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
              >
                行 {row}
              </span>

              {/* 该行按钮 */}
              {buttonsInRow(row).map((item) => {
                const colors = styleColorMap[item.style || 'primary'];
                return (
                  <div
                    key={item._id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 4,
                      background: colors.bg,
                      color: colors.text,
                      fontSize: 13,
                    }}
                  >
                    <Tooltip title={item.url} placement="top">
                      <span
                        style={{
                          maxWidth: 100,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                        }}
                        onClick={() => editButton(item)}
                      >
                        {item.name || '(未命名)'}
                      </span>
                    </Tooltip>
                    <EditOutlined
                      style={{ fontSize: 11, opacity: 0.5, cursor: 'pointer' }}
                      onClick={() => editButton(item)}
                    />
                    <CloseOutlined
                      style={{ fontSize: 10, opacity: 0.5, cursor: 'pointer', color: '#ff4d4f' }}
                      onClick={() => deleteButton(item._id)}
                    />
                  </div>
                );
              })}

              {/* 该行追加按钮 */}
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => addButtonInRow(row)}
                style={{ height: 26, fontSize: 12, padding: '0 8px' }}
              >
                添加按钮
              </Button>

              {/* 删除整行 */}
              <Tooltip title="删除此行">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteRow(row)}
                  style={{ marginLeft: 'auto', height: 26, opacity: 0.6 }}
                />
              </Tooltip>
            </div>
          ))
        )}
      </div>

      {/* 新建行 */}
      <Space>
        <Button icon={<PlusOutlined />} onClick={addRow} size="small">
          新建行
        </Button>
        {allRows.length > 0 && (
          <span style={{ color: '#8c8c8c', fontSize: 12 }}>
            共 {value.length} 个按钮，{allRows.length} 行
          </span>
        )}
      </Space>

      {/* 配置弹窗 */}
      <ButtonConfigModal
        open={modalOpen}
        item={editingItem}
        showStyle={showStyle}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
};

export default InlineMenuEditor;
