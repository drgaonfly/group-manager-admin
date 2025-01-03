import React, { useState } from 'react';
import { EditableProTable, ModalForm } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import AnswerSelect from '@/components/AnswerSelect';
// import { render } from '@testing-library/react';

type menuItem = {
  _id: string;
  answer?: string;
  skuName?: string;
};

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    correctAnswers?: any;
    user?: any;
  } & Partial<API.ItemData>;
};

interface Answer {
  brandName: string;
  skuName: string;
}

const ConfigureForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [correctAnswers, setmenu] = useState<menuItem[]>(values?.correctAnswers || []);
  console.log('values', values);

  const columns = [
    {
      title: intl.formatMessage({ id: 'answer', defaultMessage: '答案' }),
      dataIndex: 'answer',
      renderFormItem: () => <AnswerSelect />,
      render: (answer: Answer) => {
        return answer ? answer.skuName : '无';
      },
    },
    {
      title: intl.formatMessage({ id: 'count', defaultMessage: '数量' }),
      dataIndex: 'count',
      hideInSearch: false,
      copyable: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      valueType: 'option',
      width: 200,
      render: (text: any, record: any, _: any, action: any) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(`${record._id}`);
          }}
        >
          {intl.formatMessage({ id: 'edit' })}
        </a>,
      ],
    },
  ];

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'configure', defaultMessage: 'Configure' })}
      width="60%"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={updateModalOpen}
      onOpenChange={onCancel}
      onFinish={async (values: any) => {
        await onSubmit({
          ...values,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          correctAnswers: correctAnswers.map(({ _id, ...rest }) => rest),
        });
      }}
      initialValues={{ ...values }}
    >
      <>
        <EditableProTable<menuItem>
          rowKey="_id"
          headerTitle={intl.formatMessage({ id: 'correctAnswers' })}
          // @ts-ignore
          columns={columns}
          value={correctAnswers}
          name="correctAnswers"
          onChange={(value: readonly menuItem[]) => setmenu([...value])}
          editable={{
            type: 'multiple',
          }}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            position: 'bottom',
            record: () => ({
              _id: Date.now().toString(),
              menuName: '',
              url: '',
              count: 1,
              answer: '',
            }),
          }}
        />

        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      </>
    </ModalForm>
  );
};

export default ConfigureForm;
