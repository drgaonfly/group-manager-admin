import { Card, message } from 'antd';
import React, { useState } from 'react';
import { useIntl } from '@umijs/max';
import { useModel } from '@umijs/max';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { updateItem } from '@/services/ant-design-pro/api';

const ServiceLink: React.FC = () => {
  const intl = useIntl();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { serviceLinks: string }) => {
    try {
      setLoading(true);
      await updateItem('/auth/profile', values);
      message.success(intl.formatMessage({ id: 'update.success' }));
      // 更新全局状态
      if (currentUser) {
        setInitialState((s) => ({
          ...s,
          currentUser: {
            ...currentUser,
            serviceLinks: values.serviceLinks,
          },
        }));
      }
    } catch (error: any) {
      message.error(error.message || intl.formatMessage({ id: 'update.failed' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Card
        title={intl.formatMessage({ id: 'menu.account.serviceLink', defaultMessage: '服务链接' })}
      >
        <ProForm
          onFinish={handleSubmit}
          initialValues={{
            serviceLinks: (currentUser as any)?.serviceLinks || '',
          }}
          submitter={{
            submitButtonProps: {
              loading,
            },
          }}
        >
          <ProFormText
            width="xl"
            name="serviceLinks"
            label={intl.formatMessage({ id: 'service.links', defaultMessage: '服务链接' })}
            placeholder={intl.formatMessage({
              id: 'please.enter.service.links',
              defaultMessage: '请输入服务链接',
            })}
            fieldProps={{}}
            rules={[{ required: true }]}
          />
        </ProForm>
      </Card>
    </div>
  );
};

export default ServiceLink;
