import React, { useState } from 'react';
import { Button, Card } from 'antd';
import GroupWelcomeForm from './GroupWelcomeForm';

interface GroupWelcomeTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const GroupWelcomeTab: React.FC<GroupWelcomeTabProps> = ({ currentRow, onBotUpdate }) => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setFormOpen(true)}>
          配置群欢迎
        </Button>
      </div>
      <Card size="small">
        <div style={{ color: '#666' }}>
          {currentRow?.groupWelcome ? (
            <div>
              <p>✅ 已配置群欢迎消息</p>
            </div>
          ) : (
            <p>❌ 未配置群欢迎消息</p>
          )}
        </div>
      </Card>

      <GroupWelcomeForm
        open={formOpen}
        onCancel={setFormOpen}
        currentRow={currentRow}
        onSuccess={() => {
          setFormOpen(false);
          if (onBotUpdate) {
            onBotUpdate({ _id: currentRow._id });
          }
        }}
      />
    </div>
  );
};

export default GroupWelcomeTab;
