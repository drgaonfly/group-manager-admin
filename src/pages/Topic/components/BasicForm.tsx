import { useIntl } from '@umijs/max';
import React, { useState } from 'react';
import { EditableProTable, ProColumns, ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import AnswerSelect from '@/components/AnswerSelect';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';
import { FormattedMessage } from '@umijs/max';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
  setvideo1: (url: string) => void;
  video1?: string | undefined;
  video2?: string | undefined;
  setvideo2: (url: string) => void;
}

type menuItem = {
  _id: string;
};

const BasicForm: React.FC<Props> = ({
  newRecord,
  onFinish,
  values,
  setvideo1,
  video1,
  setvideo2,
  video2,
}) => {
  const intl = useIntl();

  const [menus, setMenus] = useState<menuItem[]>(values?.menus || []);

  const columns = [
    {
      title: intl.formatMessage({ id: 'menuName', defaultMessage: '按钮' }),
      dataIndex: 'menuName',
      hideInSearch: false,
    },
    {
      title: intl.formatMessage({ id: 'url', defaultMessage: '菜单链接' }),
      dataIndex: 'url',
      hideInSearch: false,
      copyable: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      valueType: 'option',
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

  const defaultFileList = video1
    ? [
        {
          uid: '-1',
          name: 'video1.mp4',
          status: 'done',
          url: video1,
          type: 'video/mp4',
        },
      ]
    : undefined;

  const defaultFileList2 = video2
    ? [
        {
          uid: '-1',
          name: 'video2.mp4',
          status: 'done',
          url: video2,
          type: 'video/mp4',
        },
      ]
    : undefined;

  return (
    <ProForm
      initialValues={{
        ...values,
        answer: values?.answer?._id,
        video1: video1,
        video2: video2,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          menus: menus,
          video1: video1,
          video2: video2,
        });
      }}
      submitter={{
        render: (props, dom) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {dom.map((button, index) => (
                <span key={index} style={{ marginLeft: 8 }}>
                  {button}
                </span>
              ))}
            </div>
          );
        },
      }}
    >
      <ProForm.Group>
        <AnswerSelect />

        <ProFormText
          name={['correctAnswers', 'count']}
          label={intl.formatMessage({ id: 'count' })}
          rules={[{ required: true }]}
          initialValue={1}
        />
      </ProForm.Group>

      <ProForm.Group>
        <Form.Item required label={intl.formatMessage({ id: 'video1' })}>
          <AliyunOSSUpload
            onFileUpload={(url: string) => {
              console.log('Uploaded file URL:', url);
              setvideo1(url);
            }}
            accept=".mp4,.avi,.mov,.flv,.wmv"
            defaultFileList={defaultFileList}
          />
        </Form.Item>

        <Form.Item required label={intl.formatMessage({ id: 'video2' })}>
          <AliyunOSSUpload
            onFileUpload={(url: string) => {
              setvideo2(url);
            }}
            accept=".mp4,.avi,.mov,.flv,.wmv"
            defaultFileList={defaultFileList2}
          />
        </Form.Item>
      </ProForm.Group>

      <EditableProTable<menuItem>
        rowKey="_id"
        headerTitle={intl.formatMessage({ id: 'start' })}
        columns={columns as ProColumns<menuItem, 'text'>[]}
        value={menus}
        onChange={(value: readonly menuItem[]) => setMenus([...value])}
        editable={{
          type: 'multiple',
        }}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          position: 'bottom',
          record: () => ({
            _id: Date.now().toString(),
            // 其他字段...
          }),
        }}
      />

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
