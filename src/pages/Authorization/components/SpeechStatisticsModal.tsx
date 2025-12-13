import React from 'react';
import { ModalForm, ProFormDigit, ProFormSwitch } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { useIntl } from '@umijs/max';

interface SpeechStatisticsModalProps {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  currentRow: any;
  onSave: (values: any) => Promise<void>;
}

const SpeechStatisticsModal: React.FC<SpeechStatisticsModalProps> = ({
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
      }}
      onFinish={async (values) => {
        try {
          await onSave({
            _id: currentRow._id,
            minSpeechLength: values.minSpeechLength,
            allowPureNumberSpeech: values.allowPureNumberSpeech,
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
    </ModalForm>
  );
};

export default SpeechStatisticsModal;
