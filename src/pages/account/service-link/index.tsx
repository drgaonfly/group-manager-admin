import { Card, message, Typography, Button, Space, Descriptions, Tag } from 'antd';
import React, { useState } from 'react';
import { useIntl, useAccess } from '@umijs/max';
import { useModel } from '@umijs/max';
import { ProForm, ProFormSwitch } from '@ant-design/pro-components';
import { updateItem } from '@/services/ant-design-pro/api';
import {
  EditOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const ServiceLink: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const { initialState, refresh } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (values: {
    bidirectional: boolean;
    groupMessage: boolean;
    keyboardConfig: boolean;
    speech_static: boolean;
    groupWelcome: boolean;
  }) => {
    try {
      setLoading(true);
      await updateItem('/auth/profile', values);
      message.success(intl.formatMessage({ id: 'update.success', defaultMessage: '更新成功' }));
      await refresh();
      setIsEditing(false);
    } catch (error: any) {
      message.error(
        error.message || intl.formatMessage({ id: 'update.failed', defaultMessage: '更新失败' }),
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStatusTag = (enabled: boolean) => {
    return enabled ? (
      <Tag icon={<CheckCircleOutlined />} color="success">
        {intl.formatMessage({ id: 'enabled', defaultMessage: '已开启' })}
      </Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="default">
        {intl.formatMessage({ id: 'disabled', defaultMessage: '未开启' })}
      </Tag>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <Card
        title={
          <Space>
            {intl.formatMessage({ id: 'menu.account.functionConfig', defaultMessage: '功能配置' })}
            {access.canSuperAdmin && (
              <>
                {isEditing ? (
                  <Button type="link" icon={<CloseOutlined />} onClick={() => setIsEditing(false)}>
                    {intl.formatMessage({ id: 'cancel', defaultMessage: '取消' })}
                  </Button>
                ) : (
                  <Button type="link" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                    {intl.formatMessage({ id: 'edit', defaultMessage: '编辑' })}
                  </Button>
                )}
              </>
            )}
          </Space>
        }
      >
        {isEditing ? (
          <ProForm
            onFinish={handleSubmit}
            initialValues={{
              bidirectional: currentUser?.bidirectional || false,
              groupMessage: currentUser?.groupMessage || false,
              keyboardConfig: currentUser?.keyboardConfig || false,
              speech_static: currentUser?.speech_static || false,
              groupWelcome: currentUser?.groupWelcome || false,
            }}
            submitter={{
              submitButtonProps: {
                loading,
              },
            }}
          >
            <ProFormSwitch
              name="bidirectional"
              label={intl.formatMessage({ id: 'bidirectional', defaultMessage: '双向转发' })}
              tooltip={intl.formatMessage({
                id: 'bidirectional.tooltip',
                defaultMessage: '开启后，拥有者可以回复客户消息，回复会自动转发给客户',
              })}
            />
            <ProFormSwitch
              name="groupMessage"
              label={intl.formatMessage({ id: 'groupMessage', defaultMessage: '群发消息' })}
              tooltip={intl.formatMessage({
                id: 'groupMessage.tooltip',
                defaultMessage: '开启后，客户的消息会自动转发给所有拥有者',
              })}
            />
            <ProFormSwitch
              name="keyboardConfig"
              label={intl.formatMessage({ id: 'keyboardConfig', defaultMessage: '自定义键盘' })}
              tooltip={intl.formatMessage({
                id: 'keyboardConfig.tooltip',
                defaultMessage: '开启后，可以在机器人配置中自定义 Telegram 键盘按钮',
              })}
            />
            <ProFormSwitch
              name="speech_static"
              label={intl.formatMessage({ id: 'speech_static', defaultMessage: '群组内发言统计' })}
              tooltip={intl.formatMessage({
                id: 'speech_static.tooltip',
                defaultMessage: '开启后，可以统计群组内成员的发言情况',
              })}
            />
            <ProFormSwitch
              name="groupWelcome"
              label={intl.formatMessage({ id: 'groupWelcome', defaultMessage: '欢迎入群' })}
              tooltip={intl.formatMessage({
                id: 'groupWelcome.tooltip',
                defaultMessage: '开启后，新成员加入群组时会自动发送欢迎消息',
              })}
            />
          </ProForm>
        ) : (
          <Descriptions column={1} bordered>
            <Descriptions.Item
              label={intl.formatMessage({ id: 'bidirectional', defaultMessage: '双向转发' })}
            >
              {renderStatusTag(currentUser?.bidirectional || false)}
              <Text type="secondary" style={{ marginLeft: 16 }}>
                {intl.formatMessage({
                  id: 'bidirectional.tooltip',
                  defaultMessage: '开启后，拥有者可以回复客户消息，回复会自动转发给客户',
                })}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({ id: 'groupMessage', defaultMessage: '群发消息' })}
            >
              {renderStatusTag(currentUser?.groupMessage || false)}
              <Text type="secondary" style={{ marginLeft: 16 }}>
                {intl.formatMessage({
                  id: 'groupMessage.tooltip',
                  defaultMessage: '开启后，客户的消息会自动转发给所有拥有者',
                })}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({ id: 'keyboardConfig', defaultMessage: '自定义键盘' })}
            >
              {renderStatusTag(currentUser?.keyboardConfig || false)}
              <Text type="secondary" style={{ marginLeft: 16 }}>
                {intl.formatMessage({
                  id: 'keyboardConfig.tooltip',
                  defaultMessage: '开启后，可以在机器人配置中自定义 Telegram 键盘按钮',
                })}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({ id: 'speech_static', defaultMessage: '群组内发言统计' })}
            >
              {renderStatusTag(currentUser?.speech_static || false)}
              <Text type="secondary" style={{ marginLeft: 16 }}>
                {intl.formatMessage({
                  id: 'speech_static.tooltip',
                  defaultMessage: '开启后，可以统计群组内成员的发言情况',
                })}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({ id: 'groupWelcome', defaultMessage: '欢迎入群' })}
            >
              {renderStatusTag(currentUser?.groupWelcome || false)}
              <Text type="secondary" style={{ marginLeft: 16 }}>
                {intl.formatMessage({
                  id: 'groupWelcome.tooltip',
                  defaultMessage: '开启后，新成员加入群组时会自动发送欢迎消息',
                })}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default ServiceLink;
