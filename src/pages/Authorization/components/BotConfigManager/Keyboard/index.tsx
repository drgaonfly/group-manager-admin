import React, { useRef, useState } from 'react';
import { Button, message } from 'antd';
import KeyboardEditor, { KeyboardEditorRef } from './KeyboardEditor';

interface KeyboardTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const KeyboardTab: React.FC<KeyboardTabProps> = ({ currentRow, onBotUpdate }) => {
  const keyboardEditorRef = useRef<KeyboardEditorRef>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentRow?._id || !onBotUpdate) return;
    setSaving(true);
    try {
      const keyboards = keyboardEditorRef.current?.getKeyboards() || [];
      await onBotUpdate({
        _id: currentRow._id,
        keyboards,
      });
      message.success('键盘配置已保存');
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '保存失败');
    }
    setSaving(false);
  };

  return (
    <div>
      <KeyboardEditor ref={keyboardEditorRef} value={currentRow?.keyboards || []} />
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button type="primary" loading={saving} onClick={handleSave}>
          保存
        </Button>
      </div>
    </div>
  );
};

export default KeyboardTab;
