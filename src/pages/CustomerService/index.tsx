import { useIntl } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Input, List, Avatar, Card, Row, Col, Typography } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import useQueryList from '@/hooks/useQueryList';

const { TextArea } = Input;
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

// Add Badge component for unread message count
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
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // useQueryList
  const { items: contacts } = useQueryList('/chats');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when selecting a contact
  useEffect(() => {
    if (selectedContact) {
      // Mock data for messages
      const mockMessages: Message[] = [
        {
          id: '1',
          content: `Hello, I'm ${selectedContact.name}. How can you help me today?`,
          sender: selectedContact.id,
          timestamp: new Date(Date.now() - 3600000),
          isCurrentUser: false,
        },
        {
          id: '2',
          content: `Hi ${selectedContact.name}, I'm here to assist you. What do you need help with?`,
          sender: 'me',
          timestamp: new Date(Date.now() - 3500000),
          isCurrentUser: true,
        },
        {
          id: '3',
          content: 'I have a question about my recent transaction.',
          sender: selectedContact.id,
          timestamp: new Date(Date.now() - 3400000),
          isCurrentUser: false,
        },
      ];
      setMessages(mockMessages);

      // Reset unread count for selected contact
    }
  }, [selectedContact]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      sender: 'me',
      timestamp: new Date(),
      isCurrentUser: true,
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    // Send message to server
    if (socketRef.current) {
      socketRef.current.emit('message', {
        content: messageInput,
        recipient: selectedContact.id,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <PageContainer>
      <Card style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
        <Row style={{ height: '100%' }}>
          {/* Contacts List */}
          <Col
            xs={24}
            sm={8}
            md={6}
            style={{ borderRight: '1px solid #f0f0f0', height: '100%', overflowY: 'auto' }}
          >
            <div style={{ padding: '10px' }}>
              <Title level={4}>
                {intl.formatMessage({ id: 'contacts', defaultMessage: 'Contacts' })}
              </Title>
              <List
                dataSource={contacts}
                renderItem={(contact: any) => (
                  <List.Item
                    onClick={() => setSelectedContact(contact)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor:
                        selectedContact?.id === contact.id ? '#f0f0f0' : 'transparent',
                      padding: '10px',
                      borderRadius: '4px',
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <Badge count={contact.unreadCount}>
                            <Avatar
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.user.name}`}
                              icon={<UserOutlined />}
                            />
                          </Badge>
                          <span>{contact.user.name}</span>
                        </div>
                      }
                      description={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Text ellipsis style={{ maxWidth: '100%' }}>
                            {contact.lastMessage}
                          </Text>
                          <span style={{ fontSize: '12px', color: '#999' }}>
                            {contact.customer.network}-{contact.customer.address}
                          </span>
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: contact.customer.isOnline ? '#52c41a' : '#f5222d',
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </Col>

          {/* Chat Area */}
          <Col
            xs={24}
            sm={16}
            md={18}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {selectedContact ? (
              <>
                {/* Chat Header */}
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

                {/* Messages */}
                <div
                  style={{
                    flex: 1,
                    padding: '20px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: msg.isCurrentUser ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        marginBottom: '10px',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: msg.isCurrentUser ? '#1890ff' : '#f0f0f0',
                          color: msg.isCurrentUser ? 'white' : 'black',
                          padding: '10px 15px',
                          borderRadius: '18px',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.content}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#999',
                          marginTop: '5px',
                          textAlign: msg.isCurrentUser ? 'right' : 'left',
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div style={{ padding: '10px 20px', borderTop: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex' }}>
                    <TextArea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={intl.formatMessage({
                        id: 'type.message',
                        defaultMessage: 'Type a message...',
                      })}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      style={{ flex: 1, marginRight: '10px' }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
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
