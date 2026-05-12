import React from 'react';
import { Button, ColorPicker, message } from 'antd';

interface TabItem {
  key: string;
  label: string | React.ReactNode;
}

interface TabColorChangerProps {
  tabItems: TabItem[];
  activeTab: string;
  onActiveTabChange: (tabKey: string) => void;
  botId: string;
  tabColors: Record<string, string>;
  onTabColorsChange: (colors: Record<string, string>) => void;
}

const TabColorChanger: React.FC<TabColorChangerProps> = ({
  tabItems,
  activeTab,
  onActiveTabChange,
  botId,
  tabColors,
  onTabColorsChange,
}) => {
  // 更新 tab 颜色
  const handleColorChange = (tabKey: string, color: string) => {
    const newColors = { ...tabColors, [tabKey]: color };
    onTabColorsChange(newColors);
    // 保存到 localStorage
    localStorage.setItem(`tabColors_${botId}`, JSON.stringify(newColors));
  };

  // 重置颜色
  const handleResetColors = () => {
    onTabColorsChange({});
    localStorage.removeItem(`tabColors_${botId}`);
    message.success('颜色配置已重置');
  };

  // 获取标签名称
  const getTabLabel = (tabKey: string) => {
    const labelMap: Record<string, string> = {
      overview: '概览',
      groupMessage: '群发消息',
      channelPost: '频道推广',
      replyRule: '回复规则',
      keyboard: '自由键盘',
      groupWelcome: '群欢迎',
      groupVerify: '群组验证',
      speechStatistics: '发言统计',
      checkinRule: '群签到',
      lotteryRule: '群抽奖',
      teaching: '教学模块',
      adRemoval: '去除广告',
    };
    return labelMap[tabKey] || tabKey;
  };

  return (
    <div style={{ width: 260 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>为标签页设置颜色</div>
        <div style={{ fontSize: '12px', color: '#666' }}>选择要设置颜色的标签页，然后选择颜色</div>
      </div>

      {/* 标签页选择 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontSize: '13px', fontWeight: '500' }}>选择标签页：</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tabItems.map((item) => (
            <div
              key={item.key}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: item.key === activeTab ? '#1890ff' : '#f0f0f0',
                color: item.key === activeTab ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '12px',
                border: tabColors[item.key]
                  ? `2px solid ${tabColors[item.key]}`
                  : '2px solid transparent',
                transition: 'all 0.2s',
              }}
              onClick={() => onActiveTabChange(item.key)}
            >
              {getTabLabel(item.key)}
            </div>
          ))}
        </div>
      </div>

      {/* 颜色选择 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontSize: '13px', fontWeight: '500' }}>
          为 &ldquo;{getTabLabel(activeTab)}&rdquo; 选择颜色：
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {[
            { name: '红色', color: '#ff4d4f' },
            { name: '橙色', color: '#fa8c16' },
            { name: '黄色', color: '#faad14' },
            { name: '绿色', color: '#52c41a' },
            { name: '蓝色', color: '#1890ff' },
            { name: '紫色', color: '#722ed1' },
            { name: '青色', color: '#13c2c2' },
            { name: '粉色', color: '#eb2f96' },
          ].map((preset) => (
            <div
              key={preset.name}
              style={{
                width: 24,
                height: 24,
                borderRadius: '4px',
                backgroundColor: preset.color,
                cursor: 'pointer',
                border: tabColors[activeTab] === preset.color ? '3px solid #333' : '2px solid #fff',
                boxShadow: '0 0 0 1px #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold',
              }}
              title={preset.name}
              onClick={() => handleColorChange(activeTab, preset.color)}
            >
              {tabColors[activeTab] === preset.color ? '✓' : ''}
            </div>
          ))}
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              border: !tabColors[activeTab] ? '3px solid #333' : '2px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            title="清除颜色"
            onClick={() => handleColorChange(activeTab, '')}
          >
            <div
              style={{
                width: '16px',
                height: '1px',
                backgroundColor: '#ff4d4f',
                transform: 'rotate(45deg)',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '12px' }}>自定义颜色：</span>
          <ColorPicker
            size="small"
            value={tabColors[activeTab] || '#1890ff'}
            onChange={(color) => handleColorChange(activeTab, color.toHexString())}
          />
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: 12 }}>
        <Button size="small" onClick={handleResetColors} block>
          重置所有颜色
        </Button>
      </div>
    </div>
  );
};

export default TabColorChanger;
