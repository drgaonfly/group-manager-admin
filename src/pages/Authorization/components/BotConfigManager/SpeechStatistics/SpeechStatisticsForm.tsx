import React, { useEffect } from 'react';
import { ModalForm, ProFormDigit, ProFormSwitch, ProFormSelect } from '@ant-design/pro-components';
import { Divider, Form, message, Spin } from 'antd';
import { useIntl, request } from '@umijs/max';

interface SpeechStatisticsFormProps {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  currentRow: any; // bot record
  onSaved?: () => void;
}

const CYCLE_OPTIONS = (intl: any) => [
  {
    label: intl.formatMessage({ id: 'reward_cycle_daily', defaultMessage: '每日' }),
    value: 'daily',
  },
  {
    label: intl.formatMessage({ id: 'reward_cycle_weekly', defaultMessage: '每周' }),
    value: 'weekly',
  },
  {
    label: intl.formatMessage({ id: 'reward_cycle_monthly', defaultMessage: '每月' }),
    value: 'monthly',
  },
];

const SpeechStatisticsForm: React.FC<SpeechStatisticsFormProps> = ({
  open,
  onOpenChange,
  currentRow,
  onSaved,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  // 打开时拉取最新配置
  useEffect(() => {
    if (!open || !currentRow?._id) return;
    setLoading(true);
    request(`/speech-configs`, { method: 'GET', params: { botId: currentRow._id } })
      .then((res: any) => {
        const d = res?.data;
        form.setFieldsValue({
          minSpeechLength: d?.minSpeechLength ?? 1,
          allowPureNumberSpeech: d?.allowPureNumberSpeech ?? false,
          // 排行榜奖励
          enableActivityReward: d?.enableActivityReward ?? false,
          activityRewardCycle: d?.activityRewardCycle ?? 'daily',
          activityRewardTopN: d?.activityRewardTopN ?? 3,
          activityRewardPoints: d?.activityRewardPoints ?? 10,
          // 即时发言奖励
          enableSpeechReward: d?.enableSpeechReward ?? false,
          speechRewardCycle: d?.speechRewardCycle ?? 'daily',
          speechRewardPoints: d?.speechRewardPoints ?? 1,
          speechRewardMaxTimes: d?.speechRewardMaxTimes ?? 5,
        });
      })
      .catch(() => {
        message.error(
          intl.formatMessage({
            id: 'speech_statistics_load_failed',
            defaultMessage: '加载配置失败',
          }),
        );
      })
      .finally(() => setLoading(false));
  }, [open, currentRow?._id]);

  return (
    <ModalForm
      form={form}
      title={intl.formatMessage(
        { id: 'speech_statistics_config_for_bot', defaultMessage: '发言统计配置 - {botName}' },
        { botName: currentRow?.botName || currentRow?.userName || '' },
      )}
      open={open}
      onOpenChange={onOpenChange}
      width={640}
      modalProps={{ destroyOnClose: true }}
      submitter={{ render: (_, dom) => dom.reverse() }}
      onFinish={async (values) => {
        try {
          await request(`/speech-configs/${currentRow._id}`, {
            method: 'PUT',
            data: values,
          });
          message.success(
            intl.formatMessage({
              id: 'speech_statistics_config_saved',
              defaultMessage: '发言统计配置已保存',
            }),
          );
          onOpenChange(false);
          onSaved?.();
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
      <Spin spinning={loading}>
        {/* ── 基础统计 ─────────────────────────────────── */}
        <Divider orientation="left" style={{ fontSize: 13, color: '#666' }}>
          {intl.formatMessage({ id: 'speech_statistics_basic', defaultMessage: '基础统计配置' })}
        </Divider>

        <ProFormDigit
          width="md"
          label={intl.formatMessage({ id: 'minSpeechLength', defaultMessage: '最小统计字数' })}
          name="minSpeechLength"
          min={1}
          tooltip="发言达到此字数才纳入统计，低于此值的发言不计入"
        />
        <ProFormSwitch
          label={intl.formatMessage({
            id: 'allowPureNumberSpeech',
            defaultMessage: '允许纯数字发言纳入统计',
          })}
          name="allowPureNumberSpeech"
          tooltip="开启后，纯数字的发言也会被纳入统计范围"
        />

        {/* ── 排行榜奖励 ───────────────────────────────── */}
        <Divider orientation="left" style={{ fontSize: 13, color: '#666' }}>
          {intl.formatMessage({ id: 'activity_reward_config', defaultMessage: '排行榜奖励' })}
        </Divider>

        <ProFormSwitch
          label={intl.formatMessage({
            id: 'enableActivityReward',
            defaultMessage: '启用排行榜奖励',
          })}
          name="enableActivityReward"
          tooltip="周期结束时，自动为发言最活跃的前 N 名用户发放积分"
        />

        <Form.Item
          noStyle
          shouldUpdate={(p, c) => p.enableActivityReward !== c.enableActivityReward}
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
                  options={CYCLE_OPTIONS(intl)}
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
                  tooltip="排名前 N 的用户获得奖励"
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

        {/* ── 即时发言奖励 ─────────────────────────────── */}
        <Divider orientation="left" style={{ fontSize: 13, color: '#666' }}>
          {intl.formatMessage({ id: 'speech_reward_config', defaultMessage: '即时发言奖励' })}
        </Divider>

        <ProFormSwitch
          label={intl.formatMessage({
            id: 'enableSpeechReward',
            defaultMessage: '启用即时发言奖励',
          })}
          name="enableSpeechReward"
          tooltip="每次发言立即获得积分，周期内达到上限次数后不再奖励"
        />

        <Form.Item noStyle shouldUpdate={(p, c) => p.enableSpeechReward !== c.enableSpeechReward}>
          {({ getFieldValue }) =>
            getFieldValue('enableSpeechReward') ? (
              <>
                <ProFormSelect
                  width="md"
                  label={intl.formatMessage({
                    id: 'speechRewardCycle',
                    defaultMessage: '奖励周期',
                  })}
                  name="speechRewardCycle"
                  options={CYCLE_OPTIONS(intl)}
                  tooltip="周期重置后，次数上限重新计算"
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
                    id: 'speechRewardPoints',
                    defaultMessage: '每次发言奖励积分',
                  })}
                  name="speechRewardPoints"
                  min={1}
                  tooltip="每条符合条件的发言获得的积分数"
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
                <ProFormDigit
                  width="md"
                  label={intl.formatMessage({
                    id: 'speechRewardMaxTimes',
                    defaultMessage: '周期内最多奖励次数',
                  })}
                  name="speechRewardMaxTimes"
                  min={1}
                  tooltip="周期内超过此次数后不再发放奖励，直到周期重置"
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({
                        id: 'speech_reward_max_times_required',
                        defaultMessage: '请输入最多奖励次数',
                      }),
                    },
                  ]}
                />
              </>
            ) : null
          }
        </Form.Item>
      </Spin>
    </ModalForm>
  );
};

export default SpeechStatisticsForm;
