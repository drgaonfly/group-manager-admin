import { message, Form } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useState, useEffect } from 'react';
import { updateItem } from '@/services/ant-design-pro/api';
import {
  ModalForm,
  ProFormTextArea,
  ProFormGroup,
  ProColumns,
  EditableProTable,
} from '@ant-design/pro-components';

type VerifyAsk = {
  _id: string;
  name: string;
  isCorrect: boolean;
};

interface GroupVerifyFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow?: any;
  onSuccess?: () => void;
}

const GroupVerifyForm: React.FC<GroupVerifyFormProps> = ({
  open,
  onCancel,
  currentRow,
  onSuccess,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [asks, setAsks] = useState<VerifyAsk[]>([]);

  useEffect(() => {
    if (open && currentRow?._id) {
      form.resetFields();

      // 设置现有的群验证数据
      if (currentRow.groupVerify) {
        const verifyData = currentRow.groupVerify;
        form.setFieldsValue({
          question: verifyData.question || '',
        });
        setAsks(verifyData.asks || []);
      } else {
        // 如果没有群验证数据，重置表单
        form.setFieldsValue({
          question: '',
        });
        setAsks([]);
      }
    }
  }, [open, currentRow, form]);

  const askColumns: ProColumns<VerifyAsk>[] = [
    {
      title: intl.formatMessage({ id: 'verify_answer', defaultMessage: '答案选项' }),
      dataIndex: 'name',
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'verify_answer_required',
              defaultMessage: '请输入答案选项',
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({ id: 'is_correct', defaultMessage: '是否正确' }),
      dataIndex: 'isCorrect',
      valueType: 'select',
      valueEnum: {
        true: {
          text: intl.formatMessage({ id: 'correct', defaultMessage: '正确' }),
          status: 'Success',
        },
        false: {
          text: intl.formatMessage({ id: 'incorrect', defaultMessage: '错误' }),
          status: 'Error',
        },
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'is_correct_required',
              defaultMessage: '请选择是否正确',
            }),
          },
        ],
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record._id);
          }}
        >
          {intl.formatMessage({ id: 'edit' })}
        </a>,
      ],
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      // 验证至少有一个正确答案
      const correctAnswers = asks.filter((ask) => ask.isCorrect);
      if (correctAnswers.length === 0) {
        message.error(
          intl.formatMessage({
            id: 'at_least_one_correct_answer',
            defaultMessage: '至少需要一个正确答案',
          }),
        );
        return false;
      }

      const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);

      // 构建群验证数据
      const groupVerifyData = {
        question: values.question || '',
        asks: asks.map(({ name, isCorrect }) => ({ name, isCorrect })),
      };

      // 使用专门的群验证更新接口
      await updateItem(`/bots/${currentRow._id}/group-verify`, groupVerifyData);

      hide();
      message.success(
        <FormattedMessage id="update_successful" defaultMessage="Update successful" />,
      );

      form.resetFields();
      setAsks([]);
      onCancel(false);
      onSuccess?.();

      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="update_failed" defaultMessage="Update failed, please try again!" />
        ),
      );
      return false;
    }
  };

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'group_verify_config', defaultMessage: '群验证配置' })}
      open={open}
      form={form}
      width={800}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onCancel(false),
      }}
      onFinish={handleSubmit}
    >
      <ProFormGroup>
        <ProFormTextArea
          name="question"
          label={intl.formatMessage({ id: 'verify_question', defaultMessage: '验证问题' })}
          placeholder={intl.formatMessage({
            id: 'verify_question_placeholder',
            defaultMessage: '请输入验证问题',
          })}
          width="xl"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'verify_question_required',
                defaultMessage: '请输入验证问题',
              }),
            },
          ]}
          extra={intl.formatMessage({
            id: 'verify_question_tip',
            defaultMessage: '新用户加入群组时需要回答的验证问题',
          })}
          fieldProps={{
            autoSize: { minRows: 8 },
          }}
        />
      </ProFormGroup>

      <EditableProTable<VerifyAsk>
        rowKey="_id"
        headerTitle={intl.formatMessage({
          id: 'verify_answers_config',
          defaultMessage: '答案选项配置',
        })}
        columns={askColumns}
        value={asks}
        onChange={(value: readonly VerifyAsk[]) => setAsks([...value])}
        editable={{
          type: 'multiple',
        }}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          position: 'bottom',
          record: () => ({
            _id: Date.now().toString(),
            name: '',
            isCorrect: false,
          }),
        }}
        toolBarRender={false}
      />
    </ModalForm>
  );
};

export default GroupVerifyForm;
