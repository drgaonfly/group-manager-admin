import MyUpload from '@/components/MyUpload';
import { ProForm, ProFormSelect, ProFormDateTimePicker } from '@ant-design/pro-components';
import { Form } from 'antd';
import React from 'react';

interface Props {
  newRecord?: boolean;
  file?: string | undefined;
  setFile?: (url: string) => void;
}

const BasicForm: React.FC<Props> = (props) => {
  const { setFile, newRecord } = props;
  return (
    <>
      <ProForm.Group>
        <ProFormSelect
          rules={[{ required: true, message: '请选择国家' }]}
          width="md"
          label="国家"
          name="country"
          valueEnum={{
            Vietnam: '越南',
            Thailand: '泰国',
            Malaysia: '马来西亚',
            Philippines: '菲律宾',
            Indonesia: '印尼',
          }}
        />

        {newRecord && (
          <Form.Item label="上传文件" name="file">
            <MyUpload
              accept=".xls,.xlsx,.csv"
              onFileUpload={(url: string) => {
                console.log('Uploaded file URL:', url);
                setFile!(url);
              }}
            />
          </Form.Item>
        )}

        <ProFormDateTimePicker
          rules={[{ required: true, message: '请选择下单时间' }]}
          width="md"
          name="orderTime"
          label="下单时间"
        />

        <ProFormSelect
          rules={[{ required: false, message: '请选择下单备注' }]}
          width="md"
          label="下单备注"
          name="orderNote"
          valueEnum={{
            ContactForVolumeWeight: '下单前联系改体积/重量',
            ContactForInventory: '下单前联系开库存',
            ContactForPrice: '下单前联系改价格',
          }}
          placeholder="可选"
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
