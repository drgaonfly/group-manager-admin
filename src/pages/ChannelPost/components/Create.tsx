import { useIntl } from '@umijs/max';
import { ModalForm } from '@ant-design/pro-components';
import BasicForm from './BasicForm';
import { updateItem } from '@/services/ant-design-pro/api';
import { message } from 'antd';
import { FormattedMessage } from '@umijs/max';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
  botId?: string; // 可选的机器人ID
}

const Create: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { open, onOpenChange, onFinish, botId } = props;

  const handleFormFinish = async (values: any): Promise<void> => {
    const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
    try {
      const sendType = values.sendType || 'scheduled';
      const formData = {
        ...values,
        bot: botId || values.bot,
      };

      if (sendType === 'immediate') {
        // 立即发送 - 使用 bot 的 send-channel-post 路由
        await updateItem(`/bots/${botId || values.bot}/send-channel-post`, formData);
        hide();
        message.success(<FormattedMessage id="send_successful" defaultMessage="发送成功" />);
      } else {
        // 定时发送 - 处理间隔时间
        const interval =
          values.timeUnit === 'hours' ? (values.interval || 1) * 60 : values.interval || 60;
        await onFinish({
          ...formData,
          interval,
        });
        hide();
      }
    } catch (error: any) {
      hide();
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="operation_failed" defaultMessage="操作失败，请重试" />
        ),
      );
    }
  };

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'add_new' })}
      width="50%"
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        footer: null,
      }}
      submitter={false}
      onFinish={async (values) => {
        await handleFormFinish(values);
        return true;
      }}
    >
      <BasicForm newRecord onFinish={handleFormFinish} />
    </ModalForm>
  );
};

export default Create;
