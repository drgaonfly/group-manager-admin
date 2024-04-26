import React, { useEffect, useState } from 'react';
import {
  ProForm,
  ProFormSelect,
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormTextArea,
  ProFormDigit,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import useQueryList from '@/hooks/useQueryList';
import { useAccess } from '@umijs/max';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';
import { locationMapping, platformNames } from '@/utils/constants';

interface Props {
  newRecord?: boolean;
  file?: string | undefined;
  setFile?: (url: string) => void;
  reviewFile?: string | undefined;
  setReviewFile?: (url: string) => void;
  initialValues?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, setReviewFile, setFile, initialValues }) => {
  const [reviewType, setReviewType] = useState(initialValues?.reviewType || '');
  const [orderTimeType, setOrderTimeType] = useState(initialValues?.orderTimeType || '');
  const access = useAccess();
  const { items: users } = useQueryList('/users', access.canAdmin);

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
          valueEnum={locationMapping}
          placeholder="请选择国家"
        />

        <ProFormSelect
          name="platform"
          label="平台"
          width="md"
          rules={[{ required: true, message: '请选择平台' }]}
          valueEnum={platformNames}
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
          <Form.Item required label="上传文件" name="file">
            <AliyunOSSUpload
              onFileUpload={(url: string) => {
                console.log('Uploaded file URL:', url);
                setFile!(url);
              }}
              accept=".xls,.xlsx"
            />
          </Form.Item>
        )}
        <ProForm.Item
          name="uploadTime"
          label="上传时间"
          rules={[{ required: true, message: '请选择下单时间' }]}
        >
          <ProFormDateTimePicker
            width="md"
            fieldProps={{
              format: 'YYYY-MM-DD', // 设置日期格式为年-月-日
              picker: 'date', // 设置 picker 类型为日期选择器
            }}
          />
        </ProForm.Item>
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
        <Form.Item required label="上传评论" name="uploadedFile">
          <AliyunOSSUpload
            onFileUpload={(url: string) => {
              console.log('Uploaded file URL:', url);
              setReviewFile!(url);
            }}
          />
        </Form.Item>
      )}
      <ProForm.Group>
        <ProFormSelect
          name="orderType"
          label="下单类型"
          mode="multiple"
          width="md"
          options={[
            { label: '正常下单', value: 'NormalOrder' },
            { label: '下单前联系改体积/重量', value: 'ContactForVolumeWeight' },
            { label: '下单前联系开库存', value: 'ContactForInventory' },
            { label: '下单前联系改价格', value: 'ContactForPrice' },
          ]}
          placeholder="请选择"
          rules={[{ required: false, message: '请选择' }]}
        />
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
