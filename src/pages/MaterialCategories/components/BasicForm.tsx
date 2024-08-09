import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSwitch, ProFormText, ProFormTreeSelect } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import useQueryList from '@/hooks/useQueryList';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';

interface Props {
  newRecord?: boolean;
  setImageUrl: (url: string | undefined) => void; // 允许 undefined 以便删除图片
  imageUrl?: string | undefined;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values, setImageUrl, imageUrl }) => {
  const intl = useIntl();
  const { items: menus, loading } = useQueryList('/material-categories');

  const defaultFileList = imageUrl
    ? [
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: imageUrl,
        },
      ]
    : [];

  return (
    <ProForm
      initialValues={{
        ...values,
        parent: values?.parent?._id,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
        });
      }}
    >
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_name' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'name' })}
          name="name"
        />

        <AliyunOSSUpload
          onFileUpload={(url: string) => {
            console.log('Uploaded file URL:', url);
            setImageUrl(url);
          }}
          onRemove={() => {
            setImageUrl(undefined);
          }}
          defaultFileList={defaultFileList}
        />

        <ProFormTreeSelect
          name="parent"
          rules={[{ required: false }]}
          width="md"
          label={intl.formatMessage({ id: 'parent' })}
          allowClear
          secondary
          fieldProps={{
            showArrow: false,
            treeDefaultExpandAll: true,
            filterTreeNode: true,
            showSearch: true,
            dropdownMatchSelectWidth: false,
            autoClearSearchValue: true,
            treeNodeFilterProp: 'name',
            fieldNames: {
              label: 'name',
              value: '_id',
              children: 'children',
            },
            treeData: menus,
            loading,
          }}
        />

        <ProFormSwitch name="featured" label={intl.formatMessage({ id: 'featured' })} />
      </ProForm.Group>

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
