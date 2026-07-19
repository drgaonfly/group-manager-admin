import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, Tooltip, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';

export type MenuItemType = 'url' | 'callback' | 'copy_text';
export type MenuItemStyle = 'primary' | 'success' | 'danger';

export interface InlineMenuItem {
  _id: string;
  name: string;
  type: MenuItemType;
  url?: string;
  callback?: string;
  copy_text?: string;
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
  onOk: (
    values: Pick<InlineMenuItem, 'name' | 'type' | 'url' | 'callback' | 'copy_text' | 'style'>,
  ) => void;
  onCancel: () => void;
  showStyle?: boolean;
}

const TYPE_OPTIONS = [
  { label: '🔗 URL 链接', value: 'url', desc: '打开外部链接' },
  { label: '💬 Callback', value: 'callback', desc: '点击后弹窗提示' },
  { label: '📋 复制文本', value: 'copy_text', desc: '点击后复制指定文本' },
];

const ButtonConfigModal: React.FC<ButtonConfigModalProps> = ({
  open,
  item,
  onOk,
  onCancel,
  showStyle = false,
}) => {
  const [form] = Form.useForm();
  const [currentType, setCurrentType] = useState<MenuItemType>('url');

  React.useEffect(() => {
    if (open) {
      const type = item.type || 'url';
      setCurrentType(type);
      form.setFieldsValue({
        name: item.name || '',
        type,
        url: item.url || '',
        callback: item.callback || '',
        copy_text: item.copy_text || '',
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
      width={440}
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

        <Form.Item name="type" label="按钮类型" rules={[{ required: true }]}>
          <Select
            options={TYPE_OPTIONS.map((o) => ({
              label: (
                <span>
                  {o.label}
                  <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 6 }}>{o.desc}</span>
                </span>
              ),
              value: o.value,
            }))}
            onChange={(v) => setCurrentType(v as MenuItemType)}
          />
        </Form.Item>

        {currentType === 'url' && (
          <Form.Item
            name="url"
            label="链接地址"
            rules={[
              { required: true, message: '请输入链接' },
              { pattern: /^https?:\/\/.+/, message: '请输入有效链接（https://...）' },
            ]}
          >
            <Input placeholder="https://t.me/..." />
          </Form.Item>
        )}

        {currentType === 'callback' && (
          <Form.Item
            name="callback"
            label="弹窗提示文字"
            tooltip="用户点击按钮后，Telegram 会弹窗显示此处填写的文字"
            rules={[{ required: true, message: '请输入弹窗文字' }]}
          >
            <Input.TextArea placeholder="例如：余额不足，请充值" rows={3} />
          </Form.Item>
        )}

        {currentType === 'copy_text' && (
          <Form.Item
            name="copy_text"
            label="复制内容"
            tooltip="用户点击后会自动复制此处填写的文本内容到剪贴板"
            rules={[{ required: true, message: '请输入要复制的文本' }]}
          >
            <Input.TextArea placeholder="点击后将复制此内容..." rows={3} />
          </Form.Item>
        )}

        {showStyle && currentType === 'url' && (
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
  const handleModalOk = (
    vals: Pick<InlineMenuItem, 'name' | 'type' | 'url' | 'callback' | 'copy_text' | 'style'>,
  ) => {
    const cleaned: Partial<InlineMenuItem> = {
      name: vals.name,
      type: vals.type,
      style: vals.style,
      url: undefined,
      callback: undefined,
      copy_text: undefined,
    };
    switch (vals.type) {
      case 'url':
        cleaned.url = vals.url;
        break;
      case 'callback':
        cleaned.callback = vals.callback;
        break;
      case 'copy_text':
        cleaned.copy_text = vals.copy_text;
        break;
    }

    if (editingItem._id) {
      // 编辑已有按钮：用 cleaned 完整替换，不继承旧字段
      triggerChange(value.map((m) => (m._id === editingItem._id ? { ...m, ...cleaned } : m)));
    } else {
      // 新建按钮
      triggerChange([
        ...value,
        { _id: Date.now().toString(), row: editingItem.row ?? 1, ...cleaned } as InlineMenuItem,
      ]);
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
          <span style={{ color: '#bfbfbf', fontSize: 13 }}>
            暂无按钮，点击「新建一行按钮」开始配置
          </span>
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
                const useStyle = showStyle && (item.type || 'url') === 'url';
                const colors = useStyle
                  ? styleColorMap[item.style || 'primary']
                  : { bg: '#f5f5f5', border: '#d9d9d9', text: '#595959' };
                const typeIconMap: Record<MenuItemType, string> = {
                  url: '🔗',
                  callback: '💬',
                  copy_text: '📋',
                };
                const typeIcon = typeIconMap[item.type || 'url'];
                const tooltipContent =
                  item.type === 'url'
                    ? item.url
                    : item.type === 'callback'
                    ? `callback: ${item.callback}`
                    : item.type === 'copy_text'
                    ? `复制: ${item.copy_text}`
                    : item.url;
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
                    <span style={{ fontSize: 11, opacity: 0.8 }}>{typeIcon}</span>
                    <Tooltip title={tooltipContent} placement="top">
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

      {/* 新建一行按钮 */}
      <Space>
        <Button icon={<PlusOutlined />} onClick={addRow} size="small">
          新建一行按钮
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
