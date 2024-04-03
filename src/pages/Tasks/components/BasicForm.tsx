import React, { useEffect, useState } from 'react';
import {
  ProForm,
  ProFormSelect,
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormTextArea,
  ProFormDigit,
  ProFormCheckbox,
} from '@ant-design/pro-components';
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

const abnormalOrderOptions = [
  { label: '下单前联系改体积/重量', value: 'ContactForVolumeWeight' },
  { label: '下单前联系开库存', value: 'ContactForInventory' },
  { label: '下单前联系改价格', value: 'ContactForPrice' },
];

const BasicForm: React.FC<Props> = ({ newRecord, setFile, setReviewFile, initialValues }) => {
  const [reviewType, setReviewType] = useState(initialValues?.reviewType || '');
  const [orderTimeType, setOrderTimeType] = useState(initialValues?.orderTimeType || '');
  const [orderType, setOrderType] = useState(initialValues?.orderType || '');
  const { items: users } = useQueryList('/users');
  const access = useAccess();

  useEffect(() => {
    if (initialValues?.reviewType) {
      setReviewType(initialValues.reviewType);
    }
    if (initialValues?.orderTimeType) {
      setOrderTimeType(initialValues.orderTimeType);
    }
  }, [initialValues]);

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
      </ProForm.Group>

      <ProForm.Group>
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
          <ProForm.Item
            name="orderTime"
            label="下单时间"
            rules={[{ required: true, message: '请选择下单时间' }]}
            extra={
              <div style={{ color: '#ff4d4f' }}>
                有时间要求请提前2小时上传，对接买手需要时间，谢谢理解和配合。
              </div>
            }
          >
            <ProFormDateTimePicker
              width="md"
              fieldProps={{
                showTime: { format: 'HH' },
                format: 'YYYY-MM-DD HH',
              }}
            />
          </ProForm.Item>
        )}
      </ProForm.Group>

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

      {reviewType === 'ReviewAfterModification' && (
        <Form.Item label="上传评论" name="uploadedFile">
          <MyUpload
            onFileUpload={(url: string) => {
              console.log('Uploaded review file URL:', url);
              setReviewFile!(url);
            }}
          />
        </Form.Item>
      )}
      <ProForm.Group>
        <ProForm.Item name="orderType" label="下单类型">
          <ProFormRadio.Group
            options={[
              { label: '正常下单', value: 'NormalOrder' },
              { label: '非正常下单', value: 'AbnormalOrder' },
            ]}
            fieldProps={{
              onChange: (e) => setOrderType(e.target.value),
            }}
          />
        </ProForm.Item>

        {orderType === 'AbnormalOrder' && (
          <ProFormCheckbox.Group
            name="abnormalReasons"
            label="非正常下单原因"
            options={abnormalOrderOptions}
          />
        )}
      </ProForm.Group>

      <ProFormTextArea
        name="orderNote"
        label="下单备注"
        width="md"
        rules={[{ required: false, message: '请输入下单备注' }]}
        placeholder="可选：请输入详细的下单备注信息"
      />
    </>
  );
};

export default BasicForm;
