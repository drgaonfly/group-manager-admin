import React, { useState, useEffect } from 'react';
import { Button, Card, message } from 'antd';
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

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setFormOpen(true)}>
          配置签到规则
        </Button>
      </div>
      <Card size="small" loading={loading}>
        <div style={{ color: '#666' }}>
          {checkinRule ? (
            <div>
              <p>✅ 已配置签到规则</p>
              <p style={{ marginTop: 8 }}>
                <strong>类型：</strong>
                {getTypeText(checkinRule.type)}
              </p>
              <p style={{ marginTop: 8 }}>
                <strong>奖励积分：</strong>
                {checkinRule.reward} 积分
              </p>
              {checkinRule.keywords && checkinRule.keywords.length > 0 && (
                <p style={{ marginTop: 8 }}>
                  <strong>触发关键词：</strong>
                  {Array.isArray(checkinRule.keywords)
                    ? checkinRule.keywords.join('、')
                    : checkinRule.keywords}
                </p>
              )}
            </div>
          ) : (
            <p>❌ 未配置签到规则</p>
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
          message.success(checkinRule ? '签到规则更新成功' : '签到规则配置成功');
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
