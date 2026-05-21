import React, { useState, useEffect } from 'react';
import { Button, Card, message, Tag } from 'antd';
import { FormattedMessage } from '@umijs/max';
import { queryList } from '@/services/ant-design-pro/api';
import CheckinRuleForm from './CheckinRuleForm';

interface CheckinRuleTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const CheckinRuleTab: React.FC<CheckinRuleTabProps> = ({ currentRow, onBotUpdate }) => {
  const [checkinRule, setCheckinRule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const fetchData = async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const response = await queryList(
        '/checkin-rules',
        { current: 1, pageSize: 1, botId: currentRow._id },
        {},
        {},
      );
      if (response?.data && response.data.length > 0) {
        setCheckinRule(response.data[0]);
      } else {
        setCheckinRule(null);
      }
    } catch (error) {
      console.error('获取签到规则失败:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentRow?._id]);

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      daily: '每日签到',
      first: '初次签到',
    };
    return typeMap[type] || type;
  };

  const formatStreakCycles = (cycles: any[]) => {
    if (!cycles || cycles.length === 0) return '';
    return cycles
      .sort((a, b) => a.days - b.days)
      .map((cycle) => `${cycle.days}天→${cycle.multiplier}倍`)
      .join('，');
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setFormOpen(true)}>
          <FormattedMessage id="configure_checkin_rule" defaultMessage="配置签到规则" />
        </Button>
      </div>
      <Card size="small" loading={loading}>
        <div style={{ color: '#666' }}>
          {checkinRule ? (
            <div>
              <p>
                ✅ <FormattedMessage id="checkin_rule_configured" defaultMessage="已配置签到规则" />
              </p>
              <p style={{ marginTop: 8 }}>
                <strong>
                  <FormattedMessage id="type" defaultMessage="类型" />：
                </strong>
                {getTypeText(checkinRule.type)}
              </p>
              <p style={{ marginTop: 8 }}>
                <strong>
                  <FormattedMessage id="reward_points" defaultMessage="奖励积分" />：
                </strong>
                {checkinRule.reward} <FormattedMessage id="points" defaultMessage="积分" />
              </p>
              {checkinRule.keywords && checkinRule.keywords.length > 0 && (
                <p style={{ marginTop: 8 }}>
                  <strong>
                    <FormattedMessage id="trigger_keywords" defaultMessage="触发关键词" />：
                  </strong>
                  {Array.isArray(checkinRule.keywords)
                    ? checkinRule.keywords.join('、')
                    : checkinRule.keywords}
                </p>
              )}
              {checkinRule.enableStreakBonus && (
                <>
                  <p style={{ marginTop: 8 }}>
                    <strong>
                      <FormattedMessage id="streak_bonus" defaultMessage="连续签到奖励" />：
                    </strong>
                    <Tag color="green" style={{ marginLeft: 8 }}>
                      <FormattedMessage id="enabled" defaultMessage="已启用" />
                    </Tag>
                  </p>
                  {checkinRule.streakCycles && checkinRule.streakCycles.length > 0 && (
                    <p style={{ marginTop: 8 }}>
                      <strong>
                        <FormattedMessage id="streak_cycles" defaultMessage="周期配置" />：
                      </strong>
                      {formatStreakCycles(checkinRule.streakCycles)}
                    </p>
                  )}
                  <p style={{ marginTop: 8 }}>
                    <strong>
                      <FormattedMessage id="max_multiplier" defaultMessage="最高倍率" />：
                    </strong>
                    {checkinRule.maxMultiplier || 4} 倍
                  </p>
                </>
              )}
            </div>
          ) : (
            <p>
              ❌{' '}
              <FormattedMessage id="checkin_rule_not_configured" defaultMessage="未配置签到规则" />
            </p>
          )}
        </div>
      </Card>

      <CheckinRuleForm
        open={formOpen}
        onCancel={setFormOpen}
        currentRow={currentRow}
        editingRecord={checkinRule}
        onSuccess={() => {
          setFormOpen(false);
          message.success(
            checkinRule ? (
              <FormattedMessage
                id="checkin_rule_update_success"
                defaultMessage="签到规则更新成功"
              />
            ) : (
              <FormattedMessage
                id="checkin_rule_config_success"
                defaultMessage="签到规则配置成功"
              />
            ),
          );
          fetchData();
          if (onBotUpdate) {
            onBotUpdate({ _id: currentRow._id });
          }
        }}
      />
    </div>
  );
};

export default CheckinRuleTab;
