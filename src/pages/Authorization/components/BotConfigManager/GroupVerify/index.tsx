import React, { useState } from 'react';
import { Button, Card } from 'antd';
import { FormattedMessage } from '@umijs/max';
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
          <FormattedMessage id="configure_group_verify" defaultMessage="配置群验证" />
        </Button>
      </div>
      <Card size="small">
        <div style={{ color: '#666' }}>
          {currentRow?.groupVerify ? (
            <div>
              <p>
                ✅ <FormattedMessage id="group_verify_configured" defaultMessage="已配置群验证" />
              </p>
              {currentRow.groupVerify.question && (
                <p style={{ marginTop: 8 }}>
                  <strong>
                    <FormattedMessage id="question" defaultMessage="问题" />：
                  </strong>
                  {currentRow.groupVerify.question}
                </p>
              )}
            </div>
          ) : (
            <p>
              ❌ <FormattedMessage id="group_verify_not_configured" defaultMessage="未配置群验证" />
            </p>
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
