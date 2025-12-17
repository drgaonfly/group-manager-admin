import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';

export type PresetItem = {
  _id: string;
  keyword: string;
  response: string;
};

export type PresetTableFormProps = {
  value: PresetItem[];
  onChange: (value: PresetItem[]) => void;
};

const PresetTableForm: React.FC<PresetTableFormProps> = ({ value, onChange }) => {
  const intl = useIntl();

  const preset_columns: ProColumns<PresetItem>[] = [
    {
      title: intl.formatMessage({ id: 'keyword', defaultMessage: '关键词' }),
      dataIndex: 'keyword',
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({ id: 'keyword_required', defaultMessage: '请输入关键词' }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({ id: 'response', defaultMessage: '回复内容' }),
      dataIndex: 'response',
      valueType: 'textarea' as const,
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'response_required',
              defaultMessage: '请输入回复内容',
            }),
          },
        ],
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
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
    <EditableProTable<PresetItem>
      rowKey="_id"
      headerTitle={intl.formatMessage({
        id: 'preset_config',
        defaultMessage: '关键词自动回复配置',
      })}
      columns={preset_columns}
      value={value}
      onChange={(newValue: readonly PresetItem[]) => onChange([...newValue])}
      editable={{
        type: 'multiple',
      }}
      recordCreatorProps={{
        newRecordType: 'dataSource',
        position: 'bottom',
        record: () => ({
          _id: Date.now().toString(),
          keyword: '',
          response: '',
        }),
      }}
    />
  );
};

export default PresetTableForm;
