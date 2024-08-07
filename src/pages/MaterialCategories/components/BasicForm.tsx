import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';
import { ProForm, ProFormText, ProFormSwitch, ProFormTreeSelect } from '@ant-design/pro-components';
import 'react-quill/dist/quill.snow.css';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';

interface Props {
  newRecord?: boolean;
  setImageUrl: (url: string) => void;
  imageUrl?: string | undefined;
  values?: any;
}

const BasicForm: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { setImageUrl, imageUrl } = props;
  const { items: categories } = useQueryList('/material-categories');

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
    <>
      <ProForm.Group>
        <ProFormText
          name="name"
          label={intl.formatMessage({ id: 'name' })}
          width="md"
          rules={[{ required: true, message: intl.formatMessage({ id: 'name.required' }) }]}
        />

        <AliyunOSSUpload
          onFileUpload={(url: string) => {
            console.log('Uploaded file URL:', url);
            setImageUrl!(url);
          }}
          accept=".jpg,.jpeg,.png,.pdf"
          defaultFileList={defaultFileList}
        />

        <ProFormTreeSelect
          name="parent"
          rules={[{ required: false }]}
          width="md"
          label={intl.formatMessage({ id: 'parent_category' })}
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
    </>
  );
};

export default BasicForm;
