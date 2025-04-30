import { useIntl } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  List,
  Avatar,
  Typography,
  Spin,
  Popconfirm,
  Input,
  Modal,
  message,
  Badge,
} from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { SendOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import useQueryList from '@/hooks/useQueryList';
import { queryList, updateItem } from '@/services/ant-design-pro/api';
import { request, FormattedMessage, useModel, useAccess } from '@umijs/max';
import Editor from '@/components/Editor';
import ReactQuill from 'react-quill';
import { format } from 'timeago.js';
import { playSound } from '@/components/socketNotification/NotificationBadge';
import { ReloadOutlined } from '@ant-design/icons'; // 引入重置图标

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

const CustomizedBadge: React.FC<{ count?: number; children: React.ReactNode }> = ({
  count,
  children,
}) => {
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
        {count > 99 ? '99+' : count}
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
  const [remarkModalVisible, setRemarkModalVisible] = useState(false);
  const [remarkInput, setRemarkInput] = useState('');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 当最后一条消息进入视口时
        if (entries[0].isIntersecting) {
          console.log('Last message is visible');
          // 这里可以添加你的逻辑，比如标记消息为已读等
        }
      },
      {
        threshold: 0.5, // 当消息有 50% 进入视口时触发
      },
    );

    if (lastMessageRef.current) {
      observer.observe(lastMessageRef.current);
    }

    return () => {
      if (lastMessageRef.current) {
        observer.unobserve(lastMessageRef.current);
      }
    };
  }, [messages]); // 当消息列表更新时重新设置观察者

  const {
    items: contacts,
    setItems: setContacts,
    loading: loadingContacts,
    setLoading: setLoadingContacts,
  } = useQueryList('/chats/latest');

  // 弹出修改备注窗口
  const handleUpdateRemark = (contactId: string, currentRemark: string = '') => {
    setEditingContactId(contactId);
    setRemarkInput(currentRemark || '');
    setRemarkModalVisible(true);
  };

  // 提交备注修改
  const submitRemarkUpdate = async () => {
    const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
    if (!editingContactId) return;
    try {
      await updateItem(`/customers/${editingContactId}/remark`, { remark: remarkInput.trim() });
      hide();

      message.success(
        <FormattedMessage id="update_successful" defaultMessage="Update successful" />,
      );
      // 更新前端联系人列表中的备注
      setContacts((prevContacts: any) =>
        prevContacts.map((contact: any) =>
          contact.customer?._id === editingContactId
            ? {
                ...contact,
                customer: {
                  ...contact.customer,
                  remark: remarkInput.trim(),
                },
              }
            : contact,
        ),
      );
      setRemarkModalVisible(false);
    } catch (error) {
      console.error('更新备注失败:', error);
    }
  };

  // Use the customer status model to track online status
  const { customerStatus } = useModel('customerStatusModel');
  // 使用聊天消息模型来处理实时消息
  const { chatMessage } = useModel('chatMessageModel');
  const { messageReadStatus } = useModel('chatMessageReadModel');

  useEffect(() => {
    const customerId = messageReadStatus?.customerId;

    const existingContact = contacts.find(
      (contact: any) =>
        contact.customer?._id === customerId && messageReadStatus?.sender === 'customer',
    );

    if (existingContact) {
      // 更新联系人列表中的未读消息数
      setContacts((prevContacts: any) =>
        prevContacts.map((contact: any) =>
          contact.customer?._id === customerId ? { ...contact, unreadCount: 0 } : contact,
        ),
      );
    }
  }, [messageReadStatus]);

  useEffect(() => {
    console.log('Chat Message:', chatMessage);

    const customerId = chatMessage?.customer?._id;

    if (!customerId) return;

    // 当收到新消息时更新消息列表
    if (selectedContact?.customer?._id === customerId && chatMessage?.sender === 'customer') {
      playSound();
      setMessages((prevMessages: any) => [...prevMessages, chatMessage]);
    }
    // 在联系人列表上不存在时
    // 检查新消息的客户是否存在于联系人列表中

    const existingContact = contacts.find(
      (contact: any) => contact.customer?._id === customerId && chatMessage?.sender === 'customer',
    );

    if (!existingContact && selectedContact?.customer?._id !== customerId) {
      playSound();
      // @ts-ignore
      setContacts((prevContacts) => [chatMessage, ...prevContacts]);
    }

    if (existingContact) {
      // 更新联系人列表中的未读消息数
      setContacts((prevContacts: any) =>
        prevContacts.map((contact: any) =>
          contact.customer?._id === customerId
            ? { ...contact, unreadCount: chatMessage.unreadCount }
            : contact,
        ),
      );
    }
  }, [chatMessage]);

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
                isOnline: customerStatus?.isOnline,
                lastOnline: customerStatus?.lastOnline,
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
          customerId: selectedContact.customer?._id,
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
          customerId: selectedContact.customer?._id,
        },
      });

      // 更新消息列表,添加新消息
      setMessages([...messages, data]);

      setMessageInput('');
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

  const [searchInput, setSearchInput] = useState('');

  // 更新联系人列表时使用搜索输入
  const fetchContacts = async (address = '') => {
    // 添加参数 address，默认值为空字符串
    setLoadingContacts(true);
    try {
      const response: any = await queryList('/chats/latest', {
        address: address.trim(), // 使用传入的 address 参数
      });
      setContacts(response.data);
    } catch (error) {
      console.error('获取联系人失败:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
        <div
          style={{
            width: 'auto',
            borderRight: '1px solid #f0f0f0',
            height: '100%',
            overflow: 'auto',
          }}
        >
          <div style={{ padding: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={intl.formatMessage({
                  id: 'search.contacts',
                  defaultMessage: '搜索地址...',
                })}
              />
              <Button type="primary" onClick={() => fetchContacts(searchInput)}>
                {intl.formatMessage({ id: 'search', defaultMessage: '搜索' })}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearchInput(''); // 清空输入框的值
                  fetchContacts(''); // 调用接口时传递空字符串
                }}
              />
            </div>
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
                        (contact) => (contact as any).user?._id === (currentUser as any)?._id,
                      )
                }
                renderItem={(contact: any) => (
                  <List.Item
                    onClick={() => setSelectedContact(contact)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor:
                        selectedContact?.id === contact.customer?._id ? '#e6f7ff' : 'transparent',
                      borderRight:
                        selectedContact?.id === contact.customer?._id
                          ? '3px solid #1890ff'
                          : 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      transition: 'all 0.3s',
                      color: selectedContact?.id === contact.customer?._id ? '#1890ff' : 'inherit',
                    }}
                    className="contact-item-hover"
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <CustomizedBadge count={contact.unreadCount}>
                            <Avatar
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.customer?._id}`}
                            />
                          </CustomizedBadge>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: contact.customer?.isOnline ? '#52c41a' : '#808080',
                                display: 'inline-block',
                              }}
                            />
                            <Text style={{ fontSize: '12px' }}>
                              {contact.customer?.isOnline
                                ? intl.formatMessage({ id: 'platform.online' })
                                : intl.formatMessage({ id: 'platform.offline' })}
                            </Text>
                            <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                              {contact.customer?.lastOnline
                                ? format(contact.customer?.lastOnline, 'zh_CN')
                                : null}
                            </span>
                            <span
                              style={{
                                fontSize: '12px',
                                marginLeft: '4px',
                                cursor: 'pointer',
                                color: '#1890ff',
                              }}
                              onClick={() =>
                                handleUpdateRemark(contact.customer?._id, contact.customer?.remark)
                              }
                            >
                              {contact.customer?.remark ? contact.customer.remark : '设置备注名'}
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
                            <span>{contact.customer?.network}-</span>
                            <Typography.Text
                              copyable={{ text: contact.customer?.address }}
                              style={{ fontSize: '12px', color: '#999' }}
                            >
                              {contact.customer?.address
                                ? `${contact.customer.address.substring(
                                    0,
                                    8,
                                  )}...${contact.customer.address.substring(
                                    contact.customer.address.length - 12,
                                  )}`
                                : ''}
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
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContact.customer?._id}`}
                    icon={<UserOutlined />}
                    style={{ marginRight: '10px' }}
                  />
                  <div>
                    <Title
                      level={5}
                      style={{ margin: 0, color: '#1890ff' }}
                      onClick={() =>
                        handleUpdateRemark(
                          selectedContact.customer?._id,
                          selectedContact.customer?.remark,
                        )
                      }
                    >
                      {selectedContact?.customer?.remark}
                    </Title>
                  </div>
                  <div>
                    <Badge
                      status={selectedContact.customer?.isOnline ? 'success' : 'default'}
                      style={{ marginLeft: '10px' }}
                    />
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
                      messages.map((msg: any, index: number) => {
                        const isCustomer = msg.sender === 'customer';
                        const isSoftDeleted = msg.isSoftDeleted;
                        const hasImage = msg.image;
                        const isLastMessage = index === messages.length - 1;
                        return (
                          <div
                            key={msg?._id}
                            ref={isLastMessage ? lastMessageRef : null}
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
                              {msg.message ? (
                                <ReactQuill value={msg.message} readOnly={true} theme="bubble" />
                              ) : hasImage ? (
                                <img
                                  src={msg.image}
                                  alt="message image"
                                  style={{ maxWidth: '100%' }}
                                />
                              ) : null}
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
                                    onConfirm={() => handleSoftDelete(msg?._id)}
                                    okText={intl.formatMessage({ id: 'yes', defaultMessage: '是' })}
                                    cancelText={intl.formatMessage({
                                      id: 'no',
                                      defaultMessage: '否',
                                    })}
                                  >
                                    <DeleteOutlined spin={deletingMessage === msg?._id} />
                                  </Popconfirm>
                                )}
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: '12px',
                                color: '#999',
                                marginTop: '5px',
                                textAlign: 'right',
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  color: '#999',
                                  fontSize: '12px',
                                  marginTop: '5px',
                                }}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              {!isCustomer && (
                                <span style={{ marginLeft: '10px', color: '#999' }}>
                                  {msg.isRead ? '已读' : '未读'}
                                </span>
                              )}
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

      <Modal
        title={intl.formatMessage({ id: 'edit.remark', defaultMessage: '修改备注' })}
        open={remarkModalVisible}
        onCancel={() => setRemarkModalVisible(false)}
        onOk={submitRemarkUpdate}
        okText={intl.formatMessage({ id: 'confirm', defaultMessage: '确认' })}
        cancelText={intl.formatMessage({ id: 'cancel', defaultMessage: '取消' })}
        maskClosable={false}
      >
        <Input
          value={remarkInput}
          onChange={(e) => setRemarkInput(e.target.value)}
          placeholder={intl.formatMessage({
            id: 'input.new.remark',
            defaultMessage: '输入新的备注...',
          })}
        />
      </Modal>
    </PageContainer>
  );
};

export default CustomerService;
