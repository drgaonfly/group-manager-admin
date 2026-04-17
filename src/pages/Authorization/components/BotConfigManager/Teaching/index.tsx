import React, { useState, useEffect } from 'react';
import { Card, Table, Empty, Button, message, Modal, Tabs, Space, InputNumber } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { queryList, removeItem, updateItem, addItem } from '@/services/ant-design-pro/api';
import EvaluationForm, { getEvaluationColumns } from './evaluationForm';
import TeacherForm, { getTeacherColumns } from './teacherForm';

interface TeachingTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const TeachingTab: React.FC<TeachingTabProps> = ({ currentRow, onBotUpdate }) => {
  const intl = useIntl();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('teachers');

  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [addEvalModalVisible, setAddEvalModalVisible] = useState(false);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [currentEval, setCurrentEval] = useState<any>(null);
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [teacherMenuBurnSeconds, setTeacherMenuBurnSeconds] = useState<number>(30);
  const [savingBurnSeconds, setSavingBurnSeconds] = useState(false);

  useEffect(() => {
    setTeacherMenuBurnSeconds(
      typeof currentRow?.teacherMenuDeleteAfterSeconds === 'number'
        ? currentRow.teacherMenuDeleteAfterSeconds
        : 30,
    );
  }, [currentRow?._id, currentRow?.teacherMenuDeleteAfterSeconds]);

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

  const handleEvalDelete = async (id: string) => {
    try {
      setLoading(true);
      const res = await removeItem(`/evaluations/${id}`);
      if ((res as any)?.success || (res as any)?.data) {
        message.success('评价已删除');
        fetchEvaluations();
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEvalSubmit = async (values: any) => {
    try {
      setLoading(true);
      const res = await addItem('/evaluations', { ...values, botId: currentRow._id });
      if ((res as any)?.success || (res as any)?.data) {
        message.success('已添加评价');
        setAddEvalModalVisible(false);
        fetchEvaluations();
      }
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubmit = async (values: any) => {
    try {
      setLoading(true);
      let res;
      if (currentTeacher?._id) {
        res = await updateItem(`/teachers/${currentTeacher._id}`, values);
      } else {
        res = await addItem('/teachers', { ...values, bot: currentRow._id });
      }

      if ((res as any)?.success || (res as any)?.data) {
        message.success(currentTeacher?._id ? '已更新老师信息' : '已添加老师');
        setTeacherModalVisible(false);
        fetchTeachers();
      }
    } catch (error) {
      console.error('Failed to submit teacher:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTeacherMenuBurn = async () => {
    if (!currentRow?._id || !onBotUpdate) return;
    try {
      setSavingBurnSeconds(true);
      await onBotUpdate({
        _id: currentRow._id,
        teacherMenuDeleteAfterSeconds: teacherMenuBurnSeconds ?? 0,
      });
      message.success('已保存老师列表阅后即焚设置');
    } catch (e) {
      console.error(e);
      message.error('保存失败');
    } finally {
      setSavingBurnSeconds(false);
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
    async (id, isAvailable) => {
      try {
        setLoading(true);
        const res = await updateItem(`/teachers/${id}`, { isAvailable });
        if ((res as any)?.success || (res as any)?.data) {
          message.success('更新成功');
          fetchTeachers();
        }
      } catch (error) {
        console.error('Failed to update teacher availability:', error);
        message.error('操作失败');
      } finally {
        setLoading(false);
      }
    },
  );

  const evalColumns = getEvaluationColumns(setCurrentEval, setAuditModalVisible, handleEvalDelete);

  return (
    <>
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>老师列表消息（阅后即焚）</div>
        <div style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
          群内成员发送「老师」后弹出的列表消息，可在下方设置若干秒后自动删除；默认 30 秒，填 0
          表示不自动删除。机器人需有删消息权限。
        </div>
        <Space wrap>
          <span>删除延迟（秒）</span>
          <InputNumber
            min={0}
            max={604800}
            step={10}
            value={teacherMenuBurnSeconds}
            onChange={(v) => setTeacherMenuBurnSeconds(typeof v === 'number' ? v : 0)}
            disabled={!onBotUpdate}
          />
          <Button
            type="primary"
            onClick={handleSaveTeacherMenuBurn}
            loading={savingBurnSeconds}
            disabled={!onBotUpdate}
          >
            保存
          </Button>
        </Space>
      </Card>
      <Card
        size="small"
        extra={
          <Space>
            {activeTab === 'teachers' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentTeacher(null);
                  setTeacherModalVisible(true);
                }}
              >
                添加老师
              </Button>
            )}
            {activeTab === 'evaluations' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setAddEvalModalVisible(true);
                }}
              >
                添加评价
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={activeTab === 'teachers' ? fetchTeachers : fetchEvaluations}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
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
            <video
              src={previewVideo}
              controls
              autoPlay
              style={{ width: '100%', maxHeight: '70vh' }}
            >
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
          mode="audit"
        />

        <EvaluationForm
          open={addEvalModalVisible}
          onCancel={() => setAddEvalModalVisible(false)}
          evaluation={{ bot: currentRow._id }}
          onSubmit={handleEvalSubmit}
          loading={loading}
          mode="add"
        />

        <TeacherForm
          open={teacherModalVisible}
          onCancel={() => setTeacherModalVisible(false)}
          onSubmit={handleTeacherSubmit}
          initialValues={currentTeacher}
          loading={loading}
        />
      </Card>
    </>
  );
};

export default TeachingTab;
