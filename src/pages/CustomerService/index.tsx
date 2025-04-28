import { useIntl } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { Button, List, Avatar, Typography, Spin, Popconfirm } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { SendOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import useQueryList from '@/hooks/useQueryList';
import { queryList } from '@/services/ant-design-pro/api';
import { request } from '@umijs/max';
import Editor from '@/components/Editor';
import ReactQuill from 'react-quill';
import { useModel } from '@umijs/max';
import { useAccess } from '@umijs/max';
import { format } from 'timeago.js';

const { Title, Text } = Typography;

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount?: number;
  online?: boolean;
}

const Badge: React.FC<{ count?: number; children: React.ReactNode }> = ({ count, children }) => {
  if (!count || count <= 0) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }}>
      {children}
      <span
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: '#ff4d4f',
          color: 'white',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '12px',
        }}
      >
        {count > 9 ? '9+' : count}
      </span>
    </div>
  );
};

const CustomerService: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [selectedContact, setSelectedContact] = useState<Contact | any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  const {
    items: contacts,
    setItems: setContacts,
    loading: loadingContacts,
  } = useQueryList('/chats/latest');

  // Use the customer status model to track online status
  const { customerStatus } = useModel('customerStatusModel');

  useEffect(() => {
    console.log('Customer Status:', customerStatus);

    // Update contact list when customer status changes
    if (customerStatus.customerId) {
      setContacts((prevContacts: any) => {
        return prevContacts.map((contact: any) => {
          // Check if this contact matches the customer whose status changed
          if (contact.customer?._id === customerStatus.customerId) {
            // Return updated contact with new online status
            return {
              ...contact,
              customer: {
                ...contact.customer,
                isOnline: customerStatus.isOnline,
                lastOnline: customerStatus.lastOnline,
              },
            };
          }
          return contact;
        });
      });
    }
  }, [customerStatus]);

  console.log('contacts', contacts);

  console.log('currentUser', currentUser);

  const fetchMessages = async () => {
    if (selectedContact?.customer?._id) {
      setLoadingMessages(true);
      try {
        const response: any = await queryList('/chats/user-messages', {
          customerId: selectedContact.customer._id,
        });
        setMessages(
          access.canSuperAdmin
            ? response.data
            : response.data.filter((msg: any) => !msg.isSoftDeleted),
        );
      } catch (error) {
        console.error('获取消息失败:', error);
      }
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedContact || sendingMessage) return;

    setSendingMessage(true);
    try {
      const { data } = await request('/chats/add-user-messages', {
        method: 'POST',
        data: {
          message: messageInput,
          customerId: selectedContact.customer._id,
        },
      });

      // 更新消息列表,添加新消息
      setMessages([...messages, data]);

      setMessageInput('');

      if (socketRef.current) {
        socketRef.current.emit('message', {
          content: messageInput,
          recipient: selectedContact.id,
        });
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSoftDelete = async (messageId: string) => {
    if (!messageId || deletingMessage) return;

    setDeletingMessage(messageId);
    try {
      await request('/chats/soft-delete', {
        method: 'POST',
        data: {
          ids: [messageId],
        },
      });
    } catch (error) {
      console.error('软删除消息失败:', error);
    } finally {
      setDeletingMessage(null);
    }
  };

  const handleSendMessage = () => {
    sendMessage();
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
        <div
          style={{
            width: '400px',
            borderRight: '1px solid #f0f0f0',
            height: '100%',
            overflow: 'auto',
          }}
        >
          <div style={{ padding: '10px' }}>
            <Title level={4} style={{ fontSize: '14px', fontWeight: 'normal' }}>
              {intl.formatMessage({ id: 'contacts', defaultMessage: '客户' })}
            </Title>
            {loadingContacts ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '28rem',
                }}
              >
                <Spin
                  tip={intl.formatMessage({
                    id: 'loading.contacts',
                    defaultMessage: '加载联系人中...',
                  })}
                />
              </div>
            ) : (
              <List
                dataSource={
                  access.canSuperAdmin
                    ? contacts
                    : contacts.filter(
                        (contact) => (contact as any).user._id === (currentUser as any)._id,
                      )
                }
                renderItem={(contact: any) => (
                  <List.Item
                    onClick={() =>
                      setSelectedContact({
                        ...contact,
                        id: contact.customer._id,
                        name: contact.customer.name,
                        online: contact.customer.isOnline,
                      })
                    }
                    style={{
                      cursor: 'pointer',
                      backgroundColor:
                        selectedContact?.id === contact.customer._id ? '#e6f7ff' : 'transparent',
                      borderRight:
                        selectedContact?.id === contact.customer._id ? '3px solid #1890ff' : 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      transition: 'all 0.3s',
                      color: selectedContact?.id === contact.customer._id ? '#1890ff' : 'inherit',
                    }}
                    className="contact-item-hover"
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <Badge count={contact.unreadCount}>
                            <Avatar
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.customer._id}`}
                            />
                          </Badge>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: contact.customer.isOnline ? '#52c41a' : '#f5222d',
                                display: 'inline-block',
                              }}
                            />
                            <Text style={{ fontSize: '12px' }}>
                              {contact.customer.isOnline
                                ? intl.formatMessage({ id: 'platform.online' })
                                : intl.formatMessage({ id: 'platform.offline' })}
                            </Text>
                            <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                              {format(contact.customer.lastOnline, 'zh_CN')}
                            </span>
                          </div>
                        </div>
                      }
                      description={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Text ellipsis style={{ maxWidth: '100%' }}>
                            {contact.lastMessage}
                          </Text>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#999',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <span>{contact.customer.network}-</span>
                            <Typography.Text copyable style={{ fontSize: '12px', color: '#999' }}>
                              {contact.customer.address}
                            </Typography.Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {selectedContact ? (
            <>
              <div style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={selectedContact.avatar}
                    icon={!selectedContact.avatar && <UserOutlined />}
                    style={{ marginRight: '10px' }}
                  />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {selectedContact.name}
                    </Title>
                    {selectedContact.online && (
                      <Text type="success" style={{ fontSize: '12px' }}>
                        Online
                      </Text>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  marginBottom: '80px',
                }}
              >
                {loadingMessages ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1,
                    }}
                  >
                    <Spin size="large" tip="Loading messages..." />
                  </div>
                ) : (
                  <>
                    {Array.isArray(messages) &&
                      messages.map((msg: any) => {
                        const isCustomer = msg.sender === 'customer';
                        const isSoftDeleted = msg.isSoftDeleted;
                        return (
                          <div
                            key={msg._id}
                            style={{
                              alignSelf: isCustomer ? 'flex-start' : 'flex-end',
                              maxWidth: '70%',
                              marginBottom: '10%',
                              position: 'relative',
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: isSoftDeleted
                                  ? 'rgba(255, 0, 0, 0.1)'
                                  : isCustomer
                                  ? '#f0f0f0'
                                  : '#1890ff',
                                color: isCustomer ? 'black' : 'white',
                                wordBreak: 'break-word',
                                position: 'relative',
                              }}
                            >
                              <ReactQuill value={msg.message} readOnly={true} theme="bubble" />
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: '-15px',
                                  fontSize: '10px',
                                  color: 'red',
                                  right: isCustomer ? '0' : '120px',
                                }}
                              >
                                {isSoftDeleted ? '已删除' : ''}
                              </span>
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '5px',
                                  right: '5px',
                                  opacity: 0.7,
                                  cursor: 'pointer',
                                  zIndex: 10,
                                  color: isCustomer ? 'black' : 'white',
                                }}
                              >
                                {access.canSoftDeleteChat && (
                                  <Popconfirm
                                    title={intl.formatMessage({
                                      id: 'delete.message.confirm',
                                      defaultMessage: '确定要删除这条消息吗？',
                                    })}
                                    onConfirm={() => handleSoftDelete(msg._id)}
                                    okText={intl.formatMessage({ id: 'yes', defaultMessage: '是' })}
                                    cancelText={intl.formatMessage({
                                      id: 'no',
                                      defaultMessage: '否',
                                    })}
                                  >
                                    <DeleteOutlined spin={deletingMessage === msg._id} />
                                  </Popconfirm>
                                )}
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: '12px',
                                color: '#999',
                                marginTop: '5px',
                                textAlign: isCustomer ? 'left' : 'right',
                              }}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        );
                      })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div
                style={{
                  padding: '10px 20px',
                  borderTop: '1px solid #f0f0f0',
                  backgroundColor: '#fff',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                }}
              >
                <div>
                  <div style={{ flex: 1, marginRight: '10px' }}>
                    <Editor
                      value={messageInput}
                      onChange={setMessageInput}
                      placeholder={intl.formatMessage({
                        id: 'type.message',
                        defaultMessage: 'Type a message...',
                      })}
                    />
                  </div>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sendingMessage}
                    loading={sendingMessage}
                    style={{ width: '25%', float: 'right', marginTop: '1%' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: '#999',
              }}
            >
              {intl.formatMessage({
                id: intl.formatMessage({
                  id: 'select.contact',
                  defaultMessage: '联系人',
                }),
                defaultMessage: intl.formatMessage({
                  id: 'Select a contact to start chatting',
                  defaultMessage: '点击选择一个联系人开始聊天',
                }),
              })}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default CustomerService;
