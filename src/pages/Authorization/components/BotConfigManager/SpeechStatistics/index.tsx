import React, { useState } from 'react';
import { Button, Card } from 'antd';
import SpeechStatisticsForm from './SpeechStatisticsForm';

interface SpeechStatisticsTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const SpeechStatisticsTab: React.FC<SpeechStatisticsTabProps> = ({ currentRow, onBotUpdate }) => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setFormOpen(true)}>
          配置发言统计
        </Button>
      </div>
      <Card size="small">
        <div style={{ color: '#666' }}>
          <p>
            <strong>最小字数：</strong>
            {currentRow?.minSpeechLength || 1} 字
          </p>
          <p>
            <strong>允许纯数字：</strong>
            {currentRow?.allowPureNumberSpeech ? '是' : '否'}
          </p>
        </div>
      </Card>

      <SpeechStatisticsForm
        open={formOpen}
        onOpenChange={setFormOpen}
        currentRow={currentRow}
        onSave={async (values) => {
          if (onBotUpdate) {
            await onBotUpdate(values);
          }
        }}
      />
    </div>
  );
};

export default SpeechStatisticsTab;
