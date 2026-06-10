import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Descriptions, Tag, Spin } from 'antd';
import { useIntl, request } from '@umijs/max';
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

const SpeechStatisticsTab: React.FC<SpeechStatisticsTabProps> = ({ currentRow }) => {
  const intl = useIntl();
  const [formOpen, setFormOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchConfig = useCallback(async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const res = await request('/speech-configs', {
        method: 'GET',
        params: { botId: currentRow._id },
      });
      setConfig(res?.data ?? null);
    } catch {
      // 拉取失败静默处理，config 为 null 时展示默认值
    } finally {
      setLoading(false);
    }
  }, [currentRow?._id]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return (
    <Spin spinning={loading}>
      <div>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={() => setFormOpen(true)}>
            {intl.formatMessage({
              id: 'configure_speech_statistics',
              defaultMessage: '配置发言统计',
            })}
          </Button>
        </div>

        {/* 基础统计 */}
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
              {config?.minSpeechLength ?? 1} 字
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'allowPureNumberSpeech',
                defaultMessage: '允许纯数字',
              })}
            >
              {config?.allowPureNumberSpeech ? (
                <Tag color="green">是</Tag>
              ) : (
                <Tag color="default">否</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 排行榜奖励 */}
        <Card
          size="small"
          title={intl.formatMessage({ id: 'activity_reward_config', defaultMessage: '排行榜奖励' })}
          style={{ marginBottom: 12 }}
        >
          <Descriptions column={1} size="small">
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'enableActivityReward',
                defaultMessage: '启用排行榜奖励',
              })}
            >
              {config?.enableActivityReward ? (
                <Tag color="green">已启用</Tag>
              ) : (
                <Tag color="default">未启用</Tag>
              )}
            </Descriptions.Item>
            {config?.enableActivityReward && (
              <>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'activityRewardCycle',
                    defaultMessage: '统计周期',
                  })}
                >
                  {CYCLE_LABEL[config?.activityRewardCycle] || '每日'}
                </Descriptions.Item>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'activityRewardTopN',
                    defaultMessage: '奖励名额',
                  })}
                >
                  前 {config?.activityRewardTopN ?? 3} 名
                </Descriptions.Item>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'activityRewardPoints',
                    defaultMessage: '每人奖励积分',
                  })}
                >
                  {config?.activityRewardPoints ?? 10} 积分
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>

        {/* 即时发言奖励 */}
        <Card
          size="small"
          title={intl.formatMessage({ id: 'speech_reward_config', defaultMessage: '即时发言奖励' })}
        >
          <Descriptions column={1} size="small">
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'enableSpeechReward',
                defaultMessage: '启用即时发言奖励',
              })}
            >
              {config?.enableSpeechReward ? (
                <Tag color="green">已启用</Tag>
              ) : (
                <Tag color="default">未启用</Tag>
              )}
            </Descriptions.Item>
            {config?.enableSpeechReward && (
              <>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'speechRewardCycle',
                    defaultMessage: '奖励周期',
                  })}
                >
                  {CYCLE_LABEL[config?.speechRewardCycle] || '每日'}
                </Descriptions.Item>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'speechRewardPoints',
                    defaultMessage: '每次发言奖励积分',
                  })}
                >
                  {config?.speechRewardPoints ?? 1} 积分 / 次
                </Descriptions.Item>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'speechRewardMaxTimes',
                    defaultMessage: '周期内最多奖励次数',
                  })}
                >
                  {config?.speechRewardMaxTimes ?? 5} 次（上限{' '}
                  {(config?.speechRewardPoints ?? 1) * (config?.speechRewardMaxTimes ?? 5)} 积分）
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>

        <SpeechStatisticsForm
          open={formOpen}
          onOpenChange={setFormOpen}
          currentRow={currentRow}
          onSaved={fetchConfig}
        />
      </div>
    </Spin>
  );
};

export default SpeechStatisticsTab;
