import { useIntl } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { Button, List, Avatar, Card, Row, Col, Typography, Spin } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import useQueryList from '@/hooks/useQueryList';
import { queryList } from '@/services/ant-design-pro/api';
import { request } from '@umijs/max';
import Editor from '@/components/Editor';
import ReactQuill from 'react-quill';
import { useModel } from '@umijs/max';

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
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [selectedContact, setSelectedContact] = useState<Contact | any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  const { items: contacts } = useQueryList('/chats');

  console.log('contacts', contacts);

  console.log('currentUser', currentUser);

  const fetchMessages = async () => {
    if (selectedContact?.customer?._id) {
      setLoadingMessages(true);
      try {
        const response: any = await queryList('/chats/user-messages', {
          customerId: selectedContact.customer._id,
        });
        setMessages(response.data);
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
      await request('/chats/add-user-messages', {
        method: 'POST',
        data: {
          message: messageInput,
          customerId: selectedContact.customer._id,
        },
      });

      await Promise.all([fetchMessages()]);

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

  const handleSendMessage = () => {
    sendMessage();
  };

  return (
    <PageContainer>
      <Card
        style={{
          height: 'calc(100vh - 100px)',
          overflowY: 'scroll',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Row style={{ height: 'auto' }}>
          <Col
            xs={24}
            sm={8}
            md={6}
            style={{ borderRight: '1px solid #f0f0f0', height: 'auto', overflowY: 'auto' }}
          >
            <div style={{ padding: '10px' }}>
              <Title level={4}>
                {intl.formatMessage({ id: 'contacts', defaultMessage: 'Contacts' })}
              </Title>
              <List
                dataSource={contacts.filter(
                  (contact) => (contact as any).user._id === (currentUser as any)._id,
                )}
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
                                height: 'auto',
                                borderRadius: '50%',
                                backgroundColor: contact.customer.isOnline ? '#52c41a' : '#f5222d',
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            <Text style={{ fontSize: '12px' }}>
                              {contact.customer.isOnline
                                ? intl.formatMessage({ id: 'platform.online' })
                                : intl.formatMessage({ id: 'platform.offline' })}
                            </Text>
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
            </div>
          </Col>

          <Col
            xs={24}
            sm={16}
            md={18}
            style={{
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
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
                      {messages.map((msg: any) => {
                        const isCustomer = msg.sender === 'customer';
                        return (
                          <div
                            key={msg.id}
                            style={{
                              alignSelf: isCustomer ? 'flex-start' : 'flex-end',
                              maxWidth: '70%',
                              marginBottom: '10px',
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: isCustomer ? '#f0f0f0' : '#1890ff',
                                color: isCustomer ? 'black' : 'white',
                                wordBreak: 'break-word',
                                marginBottom: '20%',
                              }}
                            >
                              <ReactQuill value={msg.message} readOnly={true} theme="bubble" />
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
                  height: 'auto',
                  color: '#999',
                }}
              >
                {intl.formatMessage({
                  id: 'select.contact',
                  defaultMessage: 'Select a contact to start chatting',
                })}
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default CustomerService;
