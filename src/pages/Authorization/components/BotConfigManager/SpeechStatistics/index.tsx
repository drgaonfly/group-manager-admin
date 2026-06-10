import React, { useState } from 'react';
import { Button, Card, Descriptions, Tag } from 'antd';
import { useIntl } from '@umijs/max';
import SpeechStatisticsForm from './SpeechStatisticsForm';

interface SpeechStatisticsTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const CYCLE_LABEL: Record<string, string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
};

const SpeechStatisticsTab: React.FC<SpeechStatisticsTabProps> = ({ currentRow, onBotUpdate }) => {
  const intl = useIntl();
  const [formOpen, setFormOpen] = useState(false);

  const rewardEnabled = currentRow?.enableActivityReward;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setFormOpen(true)}>
          {intl.formatMessage({
            id: 'configure_speech_statistics',
            defaultMessage: '配置发言统计',
          })}
        </Button>
      </div>

      <Card
        size="small"
        title={intl.formatMessage({
          id: 'speech_statistics_basic',
          defaultMessage: '基础统计配置',
        })}
        style={{ marginBottom: 12 }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item
            label={intl.formatMessage({ id: 'minSpeechLength', defaultMessage: '最小统计字数' })}
          >
            {currentRow?.minSpeechLength || 1} 字
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'allowPureNumberSpeech',
              defaultMessage: '允许纯数字',
            })}
          >
            {currentRow?.allowPureNumberSpeech ? (
              <Tag color="green">是</Tag>
            ) : (
              <Tag color="default">否</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        size="small"
        title={intl.formatMessage({ id: 'activity_reward_config', defaultMessage: '活跃奖励配置' })}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'enableActivityReward',
              defaultMessage: '启用活跃奖励',
            })}
          >
            {rewardEnabled ? <Tag color="green">已启用</Tag> : <Tag color="default">未启用</Tag>}
          </Descriptions.Item>
          {rewardEnabled && (
            <>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'activityRewardCycle',
                  defaultMessage: '统计周期',
                })}
              >
                {CYCLE_LABEL[currentRow?.activityRewardCycle] ||
                  currentRow?.activityRewardCycle ||
                  '每日'}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({ id: 'activityRewardTopN', defaultMessage: '奖励名额' })}
              >
                前 {currentRow?.activityRewardTopN || 3} 名
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({
                  id: 'activityRewardPoints',
                  defaultMessage: '每人奖励积分',
                })}
              >
                {currentRow?.activityRewardPoints || 10} 积分
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
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
