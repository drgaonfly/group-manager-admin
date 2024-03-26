import React, { useState } from 'react';
import {
  ProForm,
  ProFormSelect,
  ProFormDateTimePicker,
  ProFormRadio,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import MyUpload from '@/components/MyUpload';

interface Props {
  newRecord?: boolean;
  file?: string | undefined;
  setFile?: (url: string) => void;
}

const BasicForm: React.FC<Props> = ({ newRecord, setFile }) => {
  const [, setReviewType] = useState('');
  const [orderTimeType, setOrderTimeType] = useState('');

  return (
    <ProForm layout="vertical">
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

      <ProForm.Item name="orderTimeType" label="下单时间选择">
        <ProFormRadio.Group
          options={[
            { label: '正常下单', value: 'NormalOrder' },
            { label: '指定时间下单', value: 'SpecificTimeOrder' },
          ]}
          fieldProps={{
            onChange: (e) => setOrderTimeType(e.target.value),
          }}
        />
      </ProForm.Item>

      {orderTimeType === 'SpecificTimeOrder' && (
        <ProFormDateTimePicker
          name="orderTime"
          width="md"
          label="下单时间"
          rules={[{ required: true, message: '请选择下单时间' }]}
          fieldProps={{
            showTime: { format: 'HH' },
            format: 'YYYY-MM-DD HH',
          }}
        />
      )}

      <ProForm.Item name="reviewType" label="评价类型">
        <ProFormRadio.Group
          options={[
            { label: '正常评价', value: 'NormalReview' },
            { label: '评价后补', value: 'ReviewAfterModification' },
          ]}
          fieldProps={{
            onChange: (e) => setReviewType(e.target.value),
          }}
        />
      </ProForm.Item>

      {/* {reviewType === 'ReviewAfterModification' && newRecord && (
        <Form.Item
          label="上传评论"
          name="reviewFile"
        >
          <MyUpload
            accept=".zip,.rar"
            onFileUpload={(url: string) => {
              console.log('Uploaded review file URL:', url);
            }}
          />
        </Form.Item>
      )} */}

      <ProFormSelect
        name="orderNote"
        label="下单备注"
        width="md"
        rules={[{ required: false, message: '请选择下单备注' }]}
        valueEnum={{
          Normal: '正常下单',
          ContactForVolumeWeight: '下单前联系改体积/重量',
          ContactForInventory: '下单前联系开库存',
          ContactForPrice: '下单前联系改价格',
        }}
        placeholder="可选"
      />
    </ProForm>
  );
};

export default BasicForm;
