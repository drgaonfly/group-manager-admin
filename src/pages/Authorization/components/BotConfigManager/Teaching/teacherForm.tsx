import React from 'react';
import { Button, Tag, Space, Image, Popconfirm, Form } from 'antd';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSwitch,
  ProFormGroup,
} from '@ant-design/pro-components';
import { PlayCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import MyUpload from '@/components/Upload';

export const getTeacherColumns = (
  intl: any,
  setPreviewVideo: (url: string) => void,
  handleApprove: (id: string) => void,
  handleReject: (id: string) => void,
  handleDelete: (id: string) => void,
  setCurrentTeacher: (record: any) => void,
  setTeacherModalVisible: (visible: boolean) => void,
) => [
  {
    title: intl.formatMessage({ id: 'teacher' }),
    dataIndex: 'display_name',
    key: 'display_name',
    render: (display_name: string) => display_name || '-',
  },
  {
    title: intl.formatMessage({ id: 'address' }),
    dataIndex: 'address',
    key: 'address',
    render: (address: string) => address || '-',
  },
  {
    title: intl.formatMessage({ id: 'contact' }),
    dataIndex: 'contactLink',
    key: 'contactLink',
    width: 150,
    render: (link: string) =>
      link ? (
        <a href={link} target="_blank" rel="noreferrer">
          {link}
        </a>
      ) : (
        '-'
      ),
  },
  {
    title: '简介',
    dataIndex: 'brief',
    key: 'brief',
    width: 300,
    render: (brief: string) => (
      <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{brief || '-'}</div>
    ),
  },
  {
    title: '图片展示',
    dataIndex: 'images',
    key: 'images',
    width: 200,
    render: (images: string[]) =>
      images && images.length > 0 ? (
        <Image.PreviewGroup>
          <Space wrap size={[4, 4]}>
            {images.map((img: string, index: number) => (
              <Image
                key={index}
                src={img}
                width={40}
                height={40}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
              />
            ))}
          </Space>
        </Image.PreviewGroup>
      ) : (
        '-'
      ),
  },
  {
    title: '视频展示',
    dataIndex: 'videos',
    key: 'videos',
    width: 150,
    render: (videos: string[]) =>
      videos && videos.length > 0 ? (
        <Space wrap size={[4, 4]}>
          {videos.map((video: string, index: number) => (
            <Button
              key={index}
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => setPreviewVideo(video)}
            >
              视频 {index + 1}
            </Button>
          ))}
        </Space>
      ) : (
        '-'
      ),
  },
  {
    title: intl.formatMessage({ id: 'isAvailable' }),
    dataIndex: 'isAvailable',
    key: 'isAvailable',
    render: (available: boolean) => (
      <Tag color={available ? 'green' : 'red'}>{available ? '可预约' : '忙碌'}</Tag>
    ),
  },
  {
    title: intl.formatMessage({ id: 'reviews' }),
    dataIndex: 'reviews',
    key: 'reviewsCount',
    render: (reviews: any[]) => reviews?.length || 0,
  },
  {
    title: intl.formatMessage({ id: 'createdAt' }),
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'),
  },
  {
    title: intl.formatMessage({ id: 'status' }),
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      let color = 'default';
      let text = status;
      if (status === 'approved') {
        color = 'success';
        text = '已通过';
      } else if (status === 'rejected') {
        color = 'error';
        text = '已拒绝';
      } else if (status === 'pending') {
        color = 'processing';
        text = '待审核';
      }
      return <Tag color={color}>{text}</Tag>;
    },
  },
  {
    title: intl.formatMessage({ id: 'options' }),
    key: 'action',
    render: (_: any, record: any) => (
      <Space size="middle">
        {record.status === 'pending' && (
          <>
            <Button type="link" size="small" onClick={() => handleApprove(record._id)}>
              通过
            </Button>
            <Button type="link" danger size="small" onClick={() => handleReject(record._id)}>
              拒绝
            </Button>
          </>
        )}
        {record.status === 'approved' && (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                setCurrentTeacher(record);
                setTeacherModalVisible(true);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要取消该老师的认证吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small">
                取消认证
              </Button>
            </Popconfirm>
          </>
        )}
        {record.status === 'rejected' && (
          <Popconfirm
            title="确定要删除此条拒绝记录吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small">
              删除记录
            </Button>
          </Popconfirm>
        )}
      </Space>
    ),
  },
];

interface TeacherFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialValues?: any;
  loading?: boolean;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading,
}) => {
  const [form] = Form.useForm();

  return (
    <ModalForm
      title={initialValues ? '编辑老师信息' : '添加老师'}
      open={open}
      form={form}
      modalProps={{
        onCancel,
        destroyOnClose: true,
        confirmLoading: loading,
      }}
      initialValues={initialValues || { isAvailable: true }}
      onFinish={async (values) => {
        await onSubmit(values);
        return true;
      }}
      layout="vertical"
    >
      <ProFormGroup>
        <ProFormText
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户用户名' }]}
          tooltip="直接输入 @username，系统会自动关联教师"
          placeholder="例如 @username"
          width="md"
        />
        <ProFormText
          name="display_name"
          label="花名"
          rules={[{ required: true, message: '请输入花名' }]}
          placeholder="请输入花名"
          width="md"
        />
      </ProFormGroup>

      <ProFormGroup>
        <ProFormText
          name="contactLink"
          label="联系方式"
          rules={[{ required: true, message: '请输入联系方式' }]}
          placeholder="例如 https://t.me/xxx"
          width="md"
        />
        <ProFormText
          name="address"
          label="地址"
          rules={[{ required: true, message: '请输入地址' }]}
          placeholder="请输入补习地点"
          width="md"
        />
      </ProFormGroup>

      <ProFormTextArea
        name="brief"
        label="简介"
        placeholder="请输入老师简介"
        width="md"
        fieldProps={{
          autoSize: {
            minRows: 8,
          },
        }}
      />

      <ProFormSwitch name="isAvailable" label="是否可用" />

      <ProFormGroup>
        <Form.Item label="个人照片" name="images">
          <MyUpload
            multiple
            accept="image/*"
            onFileUpload={(url) => {
              const currentImages = form.getFieldValue('images') || [];
              form.setFieldsValue({ images: [...currentImages, url] });
            }}
            onRemove={(file: any) => {
              const url = file.url || file.response?.data?.file;
              const currentImages = form.getFieldValue('images') || [];
              form.setFieldsValue({
                images: currentImages.filter((i: string) => i !== url),
              });
              return true;
            }}
          />
        </Form.Item>

        <Form.Item label="展示视频" name="videos">
          <MyUpload
            multiple
            accept="video/*"
            onFileUpload={(url) => {
              const currentVideos = form.getFieldValue('videos') || [];
              form.setFieldsValue({ videos: [...currentVideos, url] });
            }}
            onRemove={(file: any) => {
              const url = file.url || file.response?.data?.file;
              const currentVideos = form.getFieldValue('videos') || [];
              form.setFieldsValue({
                videos: currentVideos.filter((i: string) => i !== url),
              });
              return true;
            }}
          />
        </Form.Item>
      </ProFormGroup>
    </ModalForm>
  );
};

export default TeacherForm;
