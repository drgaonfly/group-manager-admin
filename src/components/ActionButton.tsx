import { Button } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  SettingOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import React from 'react';

export type ActionType =
  | 'detail'
  | 'edit'
  | 'delete'
  | 'sendMessage'
  | 'sendGroupMessage'
  | 'configure'
  | 'send_message'
  | 'info'
  | 'copy'
  | 'download'
  | 'upload'
  | 'reload'
  | 'add'
  | 'custom';

interface ActionButtonProps {
  type: ActionType;
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  danger?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  onClick,
  children,
  icon,
  color,
  danger,
  disabled,
  style,
}) => {
  const intl = useIntl();

  // 图标映射
  const iconMap: Record<ActionType, React.ReactNode> = {
    detail: <EyeOutlined />,
    edit: <EditOutlined />,
    delete: <DeleteOutlined />,
    sendMessage: <SendOutlined />,
    sendGroupMessage: <TeamOutlined />,
    configure: <SettingOutlined />,
    send_message: <MessageOutlined />,
    info: <InfoCircleOutlined />,
    copy: <CopyOutlined />,
    download: <DownloadOutlined />,
    upload: <UploadOutlined />,
    reload: <ReloadOutlined />,
    add: <PlusOutlined />,
    custom: icon || null,
  };

  // 颜色映射
  const colorMap: Record<ActionType, string> = {
    detail: '#1890ff', // 蓝色
    edit: '#52c41a', // 绿色
    delete: '#ff4d4f', // 红色
    sendMessage: '#722ed1', // 紫色
    sendGroupMessage: '#eb2f96', // 粉红色
    configure: '#fa8c16', // 橙色
    send_message: '#13c2c2', // 青色
    info: '#1890ff', // 蓝色
    copy: '#2f54eb', // 深蓝色
    download: '#52c41a', // 绿色
    upload: '#fa8c16', // 橙色
    reload: '#13c2c2', // 青色
    add: '#1890ff', // 蓝色
    custom: color || '#1890ff',
  };

  // 文本映射
  const textMap: Record<ActionType, string> = {
    detail: intl.formatMessage({ id: 'detail', defaultMessage: '详情' }),
    edit: intl.formatMessage({ id: 'edit', defaultMessage: '编辑' }),
    delete: intl.formatMessage({ id: 'delete', defaultMessage: '删除' }),
    sendMessage: intl.formatMessage({ id: 'sendMessage', defaultMessage: '发送消息' }),
    sendGroupMessage: intl.formatMessage({ id: 'sendGroupMessage', defaultMessage: '群发消息' }),
    configure: intl.formatMessage({ id: 'configure', defaultMessage: '配置' }),
    send_message: intl.formatMessage({ id: 'send_message', defaultMessage: '发送消息' }),
    info: intl.formatMessage({ id: 'info', defaultMessage: '信息' }),
    copy: intl.formatMessage({ id: 'copy', defaultMessage: '复制' }),
    download: intl.formatMessage({ id: 'download', defaultMessage: '下载' }),
    upload: intl.formatMessage({ id: 'upload', defaultMessage: '上传' }),
    reload: intl.formatMessage({ id: 'reload', defaultMessage: '刷新' }),
    add: intl.formatMessage({ id: 'add', defaultMessage: '添加' }),
    custom: '',
  };

  const buttonIcon = icon || iconMap[type];
  const buttonColor = color || colorMap[type];
  const buttonText = children || textMap[type];

  return (
    <Button
      type="link"
      icon={buttonIcon}
      onClick={onClick}
      danger={danger || type === 'delete'}
      disabled={disabled}
      style={{
        color: danger || type === 'delete' ? undefined : buttonColor,
        padding: 0,
        height: 'auto',
        ...style,
      }}
    >
      {buttonText}
    </Button>
  );
};

export default ActionButton;
