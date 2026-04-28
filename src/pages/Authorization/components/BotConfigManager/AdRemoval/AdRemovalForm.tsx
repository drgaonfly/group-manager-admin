import React from 'react';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSwitch,
  ProFormSelect,
  ProFormList,
  ProFormGroup,
} from '@ant-design/pro-components';
import { Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export interface AdRemovalFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialValues?: any;
  loading?: boolean;
}

const AdRemovalForm: React.FC<AdRemovalFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading,
}) => {
  return (
    <ModalForm
      title={initialValues?._id ? '编辑拦截规则' : '添加拦截规则'}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) onCancel();
      }}
      initialValues={
        initialValues || {
          isOnline: true,
          mode: 'any',
          action: 'block',
          priority: 0,
          keywords: [],
        }
      }
      onFinish={onSubmit}
      modalProps={{
        destroyOnClose: true,
        confirmLoading: loading,
        width: '60%',
        style: { maxWidth: 1000, minWidth: 600 },
      }}
    >
      <ProFormGroup>
        <ProFormText
          name="name"
          label="规则名称"
          placeholder="例如：通用广告拦截"
          rules={[{ required: true, message: '请输入规则名称' }]}
          width="lg"
        />

        <ProFormTextArea
          name="remark"
          label="备注"
          placeholder="规则描述信息"
          fieldProps={{ autoSize: { minRows: 6 } }}
          width="lg"
        />
      </ProFormGroup>

      <ProFormGroup>
        <ProFormSelect
          name="mode"
          label="匹配模式"
          valueEnum={{
            any: '命中任意关键词 (OR)',
            all: '命中全部关键词 (AND)',
          }}
          width="lg"
        />
      </ProFormGroup>

      <Card title="关键词管理" size="small" style={{ marginTop: 16 }}>
        <ProFormList
          name="keywords"
          creatorButtonProps={{
            position: 'bottom',
            creatorButtonText: '添加关键词',
            icon: <PlusOutlined />,
            type: 'dashed',
            block: true,
          }}
          itemRender={({ listDom, action }) => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
                width: '100%',
              }}
            >
              <div style={{ flex: 1 }}>{listDom}</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>{action}</div>
            </div>
          )}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
            <ProFormText
              name="content"
              placeholder="关键词内容"
              rules={[{ required: true, message: '请输入内容' }]}
              width="xl"
              noStyle
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 14 }}>模糊匹配</span>
              <ProFormSwitch name="isFuzzy" noStyle fieldProps={{ size: 'small' }} />
            </div>
          </div>
        </ProFormList>
      </Card>
    </ModalForm>
  );
};

export default AdRemovalForm;
