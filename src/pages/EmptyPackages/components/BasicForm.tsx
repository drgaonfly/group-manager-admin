import React from 'react';
import { ProForm, ProFormSelect, ProFormDigit } from '@ant-design/pro-components';
import { Form } from 'antd';
import MyUpload from '@/components/MyUpload';
import useQueryList from '@/hooks/useQueryList';
import { useAccess } from '@umijs/max';

interface Props {
  newRecord?: boolean;
  file?: string | undefined;
  setFile?: (url: string) => void;
  reviewFile?: string | undefined;
  setReviewFile?: (url: string) => void;
  initialValues?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, setFile, setReviewFile }) => {
  const access = useAccess();
  const { items: users } = useQueryList('/users', access.canAdmin);

  return (
    <>
      <ProForm.Group>
        {access.canAdmin && (
          <ProFormSelect
            rules={[{ required: true }]}
            options={users.map((user: any) => ({
              label: user.email,
              value: user._id,
            }))}
            width="md"
            name="user"
            label="用户"
            showSearch
          />
        )}
        <ProFormSelect
          name="country"
          label="国家"
          width="md"
          rules={[{ required: true, message: '请选择国家' }]}
          valueEnum={{
            Vietnam: '越南',
            Thailand: '泰国',
            Malaysia: '马来西亚',
            Philippines: '菲律宾',
            Indonesia: '印尼',
          }}
          placeholder="请选择国家"
        />

        <ProFormSelect
          name="platform"
          label="平台"
          width="md"
          rules={[{ required: true, message: '请选择平台' }]}
          valueEnum={{
            Shopee: 'Shopee',
            Lazada: 'Lazada',
            TikTok: 'TikTok',
          }}
          placeholder="请选择平台"
        />
        <ProFormDigit
          name="quantity"
          label="单量"
          width="md"
          min={1}
          rules={[{ required: true, message: '请输入单量' }]}
          placeholder="请输入单量"
        />
      </ProForm.Group>
      <ProForm.Group>
        {newRecord && (
          <Form.Item required label="PDF 文件" name="pdfFile">
            <MyUpload
              accept=".pdf"
              onFileUpload={(url: string) => {
                console.log('Uploaded file URL:', url);
                setFile!(url);
              }}
            />
          </Form.Item>
        )}
        {newRecord && (
          <Form.Item required label="压缩文件" name="zipFile">
            <MyUpload
              accept=".zip,.rar"
              onFileUpload={(url: string) => {
                console.log('Uploaded file URL:', url);
                setReviewFile!(url);
              }}
            />
          </Form.Item>
        )}
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
