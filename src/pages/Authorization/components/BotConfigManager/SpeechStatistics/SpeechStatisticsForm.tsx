import React from 'react';
import { ModalForm, ProFormDigit, ProFormSwitch, ProFormSelect } from '@ant-design/pro-components';
import { Divider, Form, message } from 'antd';
import { useIntl } from '@umijs/max';

interface SpeechStatisticsFormProps {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  currentRow: any;
  onSave: (values: any) => Promise<void>;
}

const SpeechStatisticsForm: React.FC<SpeechStatisticsFormProps> = ({
  open,
  onOpenChange,
  currentRow,
  onSave,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();

  return (
    <ModalForm
      form={form}
      title={intl.formatMessage(
        { id: 'speech_statistics_config_for_bot', defaultMessage: '发言统计配置 - {botName}' },
        { botName: currentRow?.botName || currentRow?.userName || '' },
      )}
      open={open}
      onOpenChange={onOpenChange}
      width={600}
      modalProps={{
        destroyOnClose: true,
      }}
      initialValues={{
        minSpeechLength: currentRow?.minSpeechLength || 1,
        allowPureNumberSpeech: currentRow?.allowPureNumberSpeech ?? true,
        enableActivityReward: currentRow?.enableActivityReward ?? false,
        activityRewardTopN: currentRow?.activityRewardTopN || 3,
        activityRewardPoints: currentRow?.activityRewardPoints || 10,
        activityRewardCycle: currentRow?.activityRewardCycle || 'daily',
      }}
      onFinish={async (values) => {
        try {
          await onSave({
            _id: currentRow._id,
            minSpeechLength: values.minSpeechLength,
            allowPureNumberSpeech: values.allowPureNumberSpeech,
            enableActivityReward: values.enableActivityReward,
            activityRewardTopN: values.activityRewardTopN,
            activityRewardPoints: values.activityRewardPoints,
            activityRewardCycle: values.activityRewardCycle,
          });
          message.success(
            intl.formatMessage({
              id: 'speech_statistics_config_saved',
              defaultMessage: '发言统计配置已保存',
            }),
          );
          onOpenChange(false);
          return true;
        } catch (error) {
          message.error(
            intl.formatMessage({
              id: 'speech_statistics_config_save_failed',
              defaultMessage: '发言统计配置保存失败',
            }),
          );
          return false;
        }
      }}
    >
      <ProFormDigit
        width="md"
        label={intl.formatMessage({
          id: 'minSpeechLength',
          defaultMessage: '发言超过多少字才纳入统计',
        })}
        name="minSpeechLength"
        min={1}
        placeholder="发言超过多少字才纳入统计"
        tooltip="设置发言字数的最小阈值，低于此数值的发言将不会被统计"
      />
      <ProFormSwitch
        label={intl.formatMessage({
          id: 'allowPureNumberSpeech',
          defaultMessage: '是否允许纯数字发言纳入统计',
        })}
        name="allowPureNumberSpeech"
        tooltip="开启后，纯数字的发言也会被纳入统计范围"
      />

      <Divider orientation="left" style={{ fontSize: 13, color: '#666' }}>
        {intl.formatMessage({ id: 'activity_reward_config', defaultMessage: '活跃奖励配置' })}
      </Divider>

      <ProFormSwitch
        label={intl.formatMessage({
          id: 'enableActivityReward',
          defaultMessage: '启用活跃奖励',
        })}
        name="enableActivityReward"
        tooltip="开启后，系统将在每个统计周期结束时自动为发言最活跃的前 N 名用户发放积分奖励"
      />

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.enableActivityReward !== curr.enableActivityReward}
      >
        {({ getFieldValue }) =>
          getFieldValue('enableActivityReward') ? (
            <>
              <ProFormSelect
                width="md"
                label={intl.formatMessage({
                  id: 'activityRewardCycle',
                  defaultMessage: '统计周期',
                })}
                name="activityRewardCycle"
                tooltip="每个统计周期结束后自动结算并发放奖励"
                options={[
                  {
                    label: intl.formatMessage({ id: 'reward_cycle_daily', defaultMessage: '每日' }),
                    value: 'daily',
                  },
                  {
                    label: intl.formatMessage({
                      id: 'reward_cycle_weekly',
                      defaultMessage: '每周',
                    }),
                    value: 'weekly',
                  },
                  {
                    label: intl.formatMessage({
                      id: 'reward_cycle_monthly',
                      defaultMessage: '每月',
                    }),
                    value: 'monthly',
                  },
                ]}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'reward_cycle_required',
                      defaultMessage: '请选择统计周期',
                    }),
                  },
                ]}
              />
              <ProFormDigit
                width="md"
                label={intl.formatMessage({
                  id: 'activityRewardTopN',
                  defaultMessage: '奖励名额（前 N 名）',
                })}
                name="activityRewardTopN"
                min={1}
                max={100}
                tooltip="每个统计周期内发言条数排名前 N 的用户将获得积分奖励"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'reward_top_n_required',
                      defaultMessage: '请输入奖励名额',
                    }),
                  },
                ]}
              />
              <ProFormDigit
                width="md"
                label={intl.formatMessage({
                  id: 'activityRewardPoints',
                  defaultMessage: '每人奖励积分',
                })}
                name="activityRewardPoints"
                min={1}
                tooltip="每位获奖用户获得的积分数量"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'reward_points_required_msg',
                      defaultMessage: '请输入奖励积分',
                    }),
                  },
                ]}
              />
            </>
          ) : null
        }
      </Form.Item>
    </ModalForm>
  );
};

export default SpeechStatisticsForm;
