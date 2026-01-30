import React, { useState } from 'react';
import { Button, Card } from 'antd';
import GroupVerifyForm from './GroupVerifyForm';

interface GroupVerifyTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const GroupVerifyTab: React.FC<GroupVerifyTabProps> = ({ currentRow, onBotUpdate }) => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setFormOpen(true)}>
          配置群验证
        </Button>
      </div>
      <Card size="small">
        <div style={{ color: '#666' }}>
          {currentRow?.groupVerify ? (
            <div>
              <p>✅ 已配置群验证</p>
              {currentRow.groupVerify.question && (
                <p style={{ marginTop: 8 }}>
                  <strong>问题：</strong>
                  {currentRow.groupVerify.question}
                </p>
              )}
            </div>
          ) : (
            <p>❌ 未配置群验证</p>
          )}
        </div>
      </Card>

      <GroupVerifyForm
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

export default GroupVerifyTab;
