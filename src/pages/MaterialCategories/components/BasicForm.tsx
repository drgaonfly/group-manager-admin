import { useIntl } from '@umijs/max';
import MyUpload from '@/components/MyUpload';
import useQueryList from '@/hooks/useQueryList';
import { ProForm, ProFormText, ProFormSwitch, ProFormTreeSelect } from '@ant-design/pro-components';
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Props {
  newRecord?: boolean;
  setImageUrl: (url: string) => void;
  imageUrl?: string | undefined;
  values?: any;
}

const BasicForm: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { setImageUrl, values } = props;
  const { items: categories } = useQueryList('/admin/categories');

  const [description, setDescription] = useState(values?.description || '');

  const handleDescriptionChange = (description: string) => {
    setDescription(description);
  };

  return (
    <>
      <ProForm.Group>
        <ProFormText
          name="name"
          label={intl.formatMessage({ id: 'name' })}
          width="md"
          rules={[{ required: true, message: intl.formatMessage({ id: 'name.required' }) }]}
        />

        <ProForm.Item required label={intl.formatMessage({ id: 'image' })} name="image">
          <MyUpload
            accept="image/*"
            onFileUpload={(data: any) => {
              console.log('Uploaded resource URL:', data);
              setImageUrl(data); // Assuming 'data' is an array of objects with a 'title' property
            }}
            // defaultFileList={defaultFileList}
          />
        </ProForm.Item>

        <ProFormTreeSelect
          name="parent"
          rules={[{ required: false }]}
          width="md"
          label={intl.formatMessage({ id: 'parent' })}
          tooltip={intl.formatMessage({ id: 'parent.tooltip' })}
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
            treeData: categories,
          }}
        />

        <ProFormSwitch
          name="featured"
          label={intl.formatMessage({ id: 'featured' })}
          tooltip={intl.formatMessage({ id: 'featured.tooltip' })}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProForm.Item
          name="description"
          label={intl.formatMessage({ id: 'description' })}
          rules={[{ required: false, message: intl.formatMessage({ id: 'description.required' }) }]}
          initialValue={description}
        >
          <ReactQuill
            theme="snow"
            value={description}
            onChange={handleDescriptionChange}
            style={{ height: '300px' }}
          />
        </ProForm.Item>
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
