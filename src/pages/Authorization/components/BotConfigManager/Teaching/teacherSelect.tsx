import React, { useState, useEffect } from 'react';
import { Select, Spin, Avatar } from 'antd';
import { queryList } from '@/services/ant-design-pro/api';
import { UserOutlined } from '@ant-design/icons';

interface TeacherSelectProps {
  botId?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const TeacherSelect: React.FC<TeacherSelectProps> = ({ botId, value, onChange, placeholder }) => {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);

  const fetchInitialTeachers = async () => {
    if (!botId) return;
    try {
      setLoading(true);
      const res = await queryList('/teachers', { botId });
      if (res?.success) {
        setTeachers(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch initial teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialTeachers();
  }, [botId]);

  const handleSearch = async (val: string) => {
    if (!botId) return;
    try {
      setLoading(true);
      const res = await queryList('/teachers', { botId, display_name: val });
      if (res?.success) {
        setTeachers(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      showSearch
      value={value}
      placeholder={placeholder || '搜索老师花名'}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onSearch={handleSearch}
      onChange={onChange}
      notFoundContent={loading ? <Spin size="small" /> : null}
      style={{ width: '100%' }}
    >
      {teachers.map((t) => (
        <Select.Option key={t._id} value={t._id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar src={t.images?.[0]} size="small" icon={<UserOutlined />} />
            <span>{t.display_name}</span>
            {t.username && <span style={{ color: '#999', fontSize: '12px' }}>({t.username})</span>}
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};

export default TeacherSelect;
