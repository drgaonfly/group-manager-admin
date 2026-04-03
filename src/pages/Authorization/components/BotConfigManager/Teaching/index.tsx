import React, { useState, useEffect } from 'react';
import { Card, Table, Empty, Button, message, Modal, Tabs } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import EvaluationForm, { getEvaluationColumns } from './evaluationForm';
import TeacherForm, { getTeacherColumns } from './teacherForm';

interface TeachingTabProps {
  currentRow: any;
}

const TeachingTab: React.FC<TeachingTabProps> = ({ currentRow }) => {
  const intl = useIntl();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('teachers');

  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [currentEval, setCurrentEval] = useState<any>(null);
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);

  const fetchTeachers = async () => {
    if (!currentRow?._id) return;
    try {
      setLoading(true);
      const res = await queryList('/teachers', { botId: currentRow._id });
      if (res?.success) {
        setTeachers(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      message.error('获取老师列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluations = async () => {
    if (!currentRow?._id) return;
    try {
      setLoading(true);
      const res = await queryList('/evaluations', { botId: currentRow._id });
      if (res?.success) {
        setEvaluations(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch evaluations:', error);
      message.error('获取评价列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'teachers') {
      fetchTeachers();
    } else {
      fetchEvaluations();
    }
  }, [currentRow?._id, activeTab]);

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      const res = await updateItem(`/teachers/${id}/approve`, {});
      if ((res as any)?.success || (res as any)?.data) {
        message.success('已通过审核');
        fetchTeachers();
      }
    } catch (error) {
      console.error('Failed to approve teacher:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      const res = await updateItem(`/teachers/${id}/reject`, { remark: '未通过审核' });
      if ((res as any)?.success || (res as any)?.data) {
        message.success('已拒绝申请');
        fetchTeachers();
      }
    } catch (error) {
      console.error('Failed to reject teacher:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEvalApprove = async (id: string, remark: string) => {
    try {
      setLoading(true);
      const res = await updateItem(`/evaluations/${id}/approve`, { remark });
      if ((res as any)?.success || (res as any)?.data) {
        message.success('评价已通过审核');
        setAuditModalVisible(false);
        fetchEvaluations();
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEvalReject = async (id: string, remark: string) => {
    try {
      setLoading(true);
      const res = await updateItem(`/evaluations/${id}/reject`, { remark });
      if ((res as any)?.success || (res as any)?.data) {
        message.success('评价已拒绝');
        setAuditModalVisible(false);
        fetchEvaluations();
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubmit = async (values: any) => {
    try {
      setLoading(true);
      const res = await updateItem(`/teachers/${currentTeacher._id}`, values);
      if ((res as any)?.success || (res as any)?.data) {
        message.success('已更新老师信息');
        setTeacherModalVisible(false);
        fetchTeachers();
      }
    } catch (error) {
      console.error('Failed to update teacher:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const res = await removeItem(`/teachers/${id}`);
      if ((res as any)?.success || (res as any)?.data) {
        message.success('操作成功');
        fetchTeachers();
      }
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = getTeacherColumns(
    intl,
    setPreviewVideo,
    handleApprove,
    handleReject,
    handleDelete,
    setCurrentTeacher,
    setTeacherModalVisible,
  );

  const evalColumns = getEvaluationColumns(setCurrentEval, setAuditModalVisible);

  return (
    <Card
      size="small"
      extra={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={activeTab === 'teachers' ? fetchTeachers : fetchEvaluations}
          loading={loading}
        >
          刷新
        </Button>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="认证老师" key="teachers">
          <Table
            dataSource={teachers}
            columns={columns}
            rowKey="_id"
            size="small"
            loading={loading}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <Empty description="暂无老师数据" /> }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="评价管理" key="evaluations">
          <Table
            dataSource={evaluations}
            columns={evalColumns}
            rowKey="_id"
            size="small"
            loading={loading}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <Empty description="暂无评价数据" /> }}
          />
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title="视频预览"
        open={!!previewVideo}
        onCancel={() => setPreviewVideo(null)}
        footer={null}
        destroyOnClose
        width={800}
        centered
      >
        {previewVideo && (
          <video src={previewVideo} controls autoPlay style={{ width: '100%', maxHeight: '70vh' }}>
            您的浏览器不支持 video 标签。
          </video>
        )}
      </Modal>

      <EvaluationForm
        open={auditModalVisible}
        onCancel={() => setAuditModalVisible(false)}
        evaluation={currentEval}
        onApprove={handleEvalApprove}
        onReject={handleEvalReject}
        loading={loading}
      />

      <TeacherForm
        open={teacherModalVisible}
        onCancel={() => setTeacherModalVisible(false)}
        onSubmit={handleTeacherSubmit}
        initialValues={currentTeacher}
        loading={loading}
      />
    </Card>
  );
};

export default TeachingTab;
