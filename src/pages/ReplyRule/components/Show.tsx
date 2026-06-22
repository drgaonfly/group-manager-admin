import { ProDescriptions } from '@ant-design/pro-components';
import { Modal, Tag, Image, Space } from 'antd';
import React from 'react';

interface Props {
  onClose: () => void;
  open: boolean;
  currentRow: any;
}

const Show: React.FC<Props> = ({ onClose, open, currentRow }) => {
  if (!currentRow) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="75%"
      centered
      title="回复规则详情"
      className="rounded-lg overflow-hidden"
    >
      <ProDescriptions
        column={2}
        dataSource={currentRow}
        bordered
        labelStyle={{
          width: '15%',
          justifyContent: 'flex-end',
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
        }}
        contentStyle={{
          width: '35%',
          padding: '8px 16px',
        }}
        size="small"
        style={{ marginTop: '20px' }}
        columns={[
          {
            title: '机器人',
            dataIndex: ['bot', 'botName'],
            render: (_, record) => record?.bot?.botName || '-',
          },
          {
            title: '关键词',
            dataIndex: 'keyword',
            render: (_, record) => {
              const keywords = Array.isArray(record.keyword) ? record.keyword : [record.keyword];
              return (
                <Space wrap size={[4, 4]}>
                  {keywords.map((k: string, idx: number) => (
                    <Tag key={idx} color="blue">
                      {k}
                    </Tag>
                  ))}
                </Space>
              );
            },
          },
          {
            title: '回复内容',
            dataIndex: 'content',
            span: 2,
            render: (_, record) => (
              <div
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: record.content || '' }}
              />
            ),
          },
          {
            title: '媒体文件',
            dataIndex: 'medias',
            span: 2,
            render: (_, record) =>
              record.medias && record.medias.length > 0 ? (
                <Space wrap>
                  {record.medias.map((url: string, idx: number) => {
                    const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(url);
                    return isVideo ? (
                      <video key={idx} src={url} style={{ maxWidth: 100 }} controls />
                    ) : (
                      <Image key={idx} src={url} width={100} />
                    );
                  })}
                </Space>
              ) : (
                '-'
              ),
          },
          {
            title: '内联菜单',
            dataIndex: 'menus',
            span: 2,
            render: (_, record) =>
              record.menus && record.menus.length > 0 ? (
                <Space direction="vertical">
                  {record.menus.map((menu: any, idx: number) => {
                    const styleMap = {
                      primary: { color: '#1890ff', text: '蓝色', emoji: '🔵' },
                      success: { color: '#52c41a', text: '绿色', emoji: '🟢' },
                      danger: { color: '#ff4d4f', text: '红色', emoji: '🔴' },
                    };
                    const style = styleMap[menu.style as keyof typeof styleMap] || styleMap.primary;

                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag color="blue">{menu.name}</Tag>
                        <span style={{ color: style.color, fontWeight: 'bold' }}>
                          {style.emoji} {style.text}
                        </span>
                        <span>行号: {menu.row || 0}</span>
                        <a href={menu.url} target="_blank" rel="noreferrer">
                          {menu.url}
                        </a>
                      </div>
                    );
                  })}
                </Space>
              ) : (
                '-'
              ),
          },
          {
            title: '引用用户消息',
            dataIndex: 'replyToMessage',
            render: (_, record) =>
              record.replyToMessage ? <Tag color="green">是</Tag> : <Tag>否</Tag>,
          },
          {
            title: '回复管理员',
            dataIndex: 'replyToAdmin',
            render: (_, record) =>
              record.replyToAdmin !== false ? <Tag color="green">是</Tag> : <Tag>否</Tag>,
          },
          {
            title: '阅后即焚',
            dataIndex: 'deleteAfterSeconds',
            render: (_, record) =>
              record.deleteAfterSeconds ? (
                <Tag color="orange">{record.deleteAfterSeconds}秒</Tag>
              ) : (
                '-'
              ),
          },
          {
            title: '删除用户消息',
            dataIndex: 'deleteUserMsgAfterSeconds',
            render: (_, record) =>
              record.deleteUserMsgAfterSeconds ? (
                <Tag color="orange">{record.deleteUserMsgAfterSeconds}秒</Tag>
              ) : (
                '-'
              ),
          },
          {
            title: '状态',
            dataIndex: 'isOnline',
            render: (_, record) => (
              <Tag color={record.isOnline ? 'green' : 'default'}>
                {record.isOnline ? '在线' : '离线'}
              </Tag>
            ),
          },
          {
            title: '创建时间',
            dataIndex: 'createdAt',
            valueType: 'dateTime',
          },
        ]}
      />
    </Modal>
  );
};

export default Show;
