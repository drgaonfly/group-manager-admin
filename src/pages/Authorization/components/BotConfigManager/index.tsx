import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Tabs, message, Button, Popover } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import TabColorChanger from '../TabColorChangeer';
import OverviewTab from './Overview';
import GroupMessageTab from './GroupMessage';
import ChannelPostTab from './ChannelPost';
import ReplyRuleTab from './ReplyRule';
import KeyboardTab from './Keyboard';
import GroupWelcomeTab from './GroupWelcome';
import GroupVerifyTab from './GroupVerify';
import SpeechStatisticsTab from './SpeechStatistics';
import CheckinRuleTab from './CheckinRule';
import LotteryRuleTab from './LotteryRule';
import TeachingTab from './Teaching';
import AdRemovalTab from './AdRemoval';

interface BotConfigManagerProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow: any;
  currentUser: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const BotConfigManager: React.FC<BotConfigManagerProps> = ({
  open,
  onCancel,
  currentRow,
  currentUser,
  onBotUpdate,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState('overview');
  const [botConfig, setBotConfig] = useState<any>({});
  const [colorSettingVisible, setColorSettingVisible] = useState(false);
  const [tabColors, setTabColors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && currentRow?._id) {
      setActiveTab('overview');
      setBotConfig({
        canGroupMessaging: currentRow.canGroupMessaging,
        canOpenChannelPost: currentRow.canOpenChannelPost,
        canReplyRule: currentRow.canReplyRule,
        canFreeKeyboard: currentRow.canFreeKeyboard,
        canGroupWelcome: currentRow.canGroupWelcome,
        canGroupVerify: currentRow.canGroupVerify,
        canSpeechStatic: currentRow.canSpeechStatic,
        canBidirectional: currentRow.canBidirectional,
        canReportMemberNameUpdated: currentRow.canReportMemberNameUpdated,
        canCheckIn: currentRow.canCheckIn,
        canLotteryRule: currentRow.canLotteryRule,
        canTeaching: currentRow.canTeaching,
        canRemoveAd: currentRow.canRemoveAd,
      });

      // 从 localStorage 加载颜色配置
      const savedColors = localStorage.getItem(`tabColors_${currentRow._id}`);
      if (savedColors) {
        setTabColors(JSON.parse(savedColors));
      } else {
        setTabColors({});
      }
    }
  }, [open, currentRow]);

  // 更新 Bot 功能开关
  const handleBotConfigChange = async (field: string, value: boolean) => {
    if (!currentRow?._id || !onBotUpdate) return;
    try {
      await onBotUpdate({ _id: currentRow._id, [field]: value });
      setBotConfig((prev: any) => ({ ...prev, [field]: value }));
      message.success(intl.formatMessage({ id: 'update_successful', defaultMessage: '更新成功' }));
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          intl.formatMessage({ id: 'update_failed', defaultMessage: '更新失败，请重试！' }),
      );
    }
  };

  // 处理颜色变化的回调
  const handleTabColorsChange = (newColors: Record<string, string>) => {
    setTabColors(newColors);
  };

  // 动态生成 tab 样式
  const generateTabStyles = () => {
    if (Object.keys(tabColors).length === 0) return null;

    const styles = Object.entries(tabColors)
      .map(([tabKey, color]) => {
        if (!color) return '';

        return `
        .colored-tabs .ant-tabs-tab[data-node-key="${tabKey}"] {
          background: linear-gradient(135deg, ${color}15, ${color}25) !important;
          border: 1px solid ${color}40 !important;
          border-radius: 6px !important;
          margin: 2px 0 !important;
        }
        
        .colored-tabs .ant-tabs-tab[data-node-key="${tabKey}"]:hover {
          background: linear-gradient(135deg, ${color}25, ${color}35) !important;
          border-color: ${color}60 !important;
        }
        
        .colored-tabs .ant-tabs-tab[data-node-key="${tabKey}"].ant-tabs-tab-active {
          background: linear-gradient(135deg, ${color}30, ${color}40) !important;
          border-color: ${color}80 !important;
          box-shadow: 0 2px 8px ${color}30 !important;
        }
        
        .colored-tabs .ant-tabs-tab[data-node-key="${tabKey}"] .ant-tabs-tab-btn {
          color: ${color} !important;
          font-weight: 500 !important;
        }
      `;
      })
      .join('\n');

    return (
      <style>
        {`
          .colored-tabs {
            padding: 0 8px;
          }
          .colored-tabs .ant-tabs-tab {
            transition: all 0.3s ease !important;
            margin: 2px 8px 2px 0 !important;
          }
          .colored-tabs .ant-tabs-content-holder {
            padding-left: 20px !important;
            border-left: 1px solid #f0f0f0;
            margin-left: 8px;
          }
          .colored-tabs .ant-tabs-nav {
            margin-right: 0 !important;
          }
          .colored-tabs .ant-tabs-tab-btn {
            padding: 10px 16px !important;
            width: 100%;
            text-align: left;
          }
          .colored-tabs .ant-tabs-nav-list {
            padding: 8px 0;
          }
          ${styles}
        `}
      </style>
    );
  };

  // 生成带颜色的标签
  const getColoredLabel = (text: string) => {
    // 现在主要通过 CSS 来实现颜色效果，这里只返回文本
    return text;
  };

  // 动态生成 tab 列表
  const tabItems = useMemo(() => {
    const items = [];

    // 概览 Tab - 始终显示
    items.push({
      key: 'overview',
      label: getColoredLabel(intl.formatMessage({ id: 'overview', defaultMessage: '概览' })),
      children: (
        <OverviewTab
          currentRow={currentRow}
          currentUser={currentUser}
          botConfig={botConfig}
          onBotConfigChange={handleBotConfigChange}
        />
      ),
    });

    // 群发消息 Tab
    if (botConfig.canGroupMessaging && currentUser?.groupMessage) {
      items.push({
        key: 'groupMessage',
        label: getColoredLabel(
          intl.formatMessage({ id: 'group_message', defaultMessage: '群发消息' }),
        ),
        children: <GroupMessageTab currentRow={currentRow} />,
      });
    }

    // 频道推广 Tab
    if (botConfig.canOpenChannelPost && currentUser?.channelPost) {
      items.push({
        key: 'channelPost',
        label: getColoredLabel(
          intl.formatMessage({ id: 'channel_post', defaultMessage: '频道推广' }),
        ),
        children: <ChannelPostTab currentRow={currentRow} />,
      });
    }

    // 回复规则 Tab
    if (botConfig.canReplyRule && currentUser?.replyRule) {
      items.push({
        key: 'replyRule',
        label: getColoredLabel(
          intl.formatMessage({ id: 'reply_rule', defaultMessage: '回复规则' }),
        ),
        children: <ReplyRuleTab currentRow={currentRow} />,
      });
    }

    // 键盘配置 Tab
    if (botConfig.canFreeKeyboard && currentUser?.keyboardConfig) {
      items.push({
        key: 'keyboard',
        label: getColoredLabel(
          intl.formatMessage({ id: 'free_keyboard', defaultMessage: '自由键盘' }),
        ),
        children: <KeyboardTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 群欢迎 Tab
    if (botConfig.canGroupWelcome && currentUser?.groupWelcome) {
      items.push({
        key: 'groupWelcome',
        label: getColoredLabel(
          intl.formatMessage({ id: 'group_welcome', defaultMessage: '群欢迎' }),
        ),
        children: <GroupWelcomeTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 群组验证 Tab
    if (botConfig.canGroupVerify && currentUser?.groupVerify) {
      items.push({
        key: 'groupVerify',
        label: getColoredLabel(
          intl.formatMessage({ id: 'group_verify', defaultMessage: '群组验证' }),
        ),
        children: <GroupVerifyTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 发言统计 Tab
    if (botConfig.canSpeechStatic && currentUser?.speech_static) {
      items.push({
        key: 'speechStatistics',
        label: getColoredLabel(
          intl.formatMessage({ id: 'speech_statistics', defaultMessage: '发言统计' }),
        ),
        children: <SpeechStatisticsTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 群签到 Tab
    if (botConfig.canCheckIn && currentUser?.checkinRule) {
      items.push({
        key: 'checkinRule',
        label: getColoredLabel(
          intl.formatMessage({ id: 'checkin_rule', defaultMessage: '群签到' }),
        ),
        children: <CheckinRuleTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 群抽奖 Tab
    if (botConfig.canLotteryRule && currentUser?.lotteryRule) {
      items.push({
        key: 'lotteryRule',
        label: getColoredLabel(
          intl.formatMessage({ id: 'lottery_rule', defaultMessage: '群抽奖' }),
        ),
        children: <LotteryRuleTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 教学模块 Tab
    if (botConfig.canTeaching && currentUser?.teaching) {
      items.push({
        key: 'teaching',
        label: getColoredLabel(intl.formatMessage({ id: 'teaching', defaultMessage: '教学模块' })),
        children: <TeachingTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    // 去除广告 Tab
    if (botConfig.canRemoveAd) {
      items.push({
        key: 'adRemoval',
        label: getColoredLabel(
          intl.formatMessage({ id: 'ad_removal', defaultMessage: '去除广告' }),
        ),
        children: <AdRemovalTab currentRow={currentRow} onBotUpdate={onBotUpdate} />,
      });
    }

    return items;
  }, [currentRow, currentUser, botConfig, onBotUpdate]);

  // 颜色设置面板内容
  const colorSettingContent = (
    <TabColorChanger
      tabItems={tabItems}
      activeTab={activeTab}
      onActiveTabChange={setActiveTab}
      botId={currentRow?._id}
      tabColors={tabColors}
      onTabColorsChange={handleTabColorsChange}
    />
  );

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            {`${currentRow?.botName || currentRow?.userName} - ${intl.formatMessage({
              id: 'function_config',
              defaultMessage: '功能配置',
            })}`}
          </span>
          <Popover
            content={colorSettingContent}
            title={null}
            trigger="click"
            open={colorSettingVisible}
            onOpenChange={setColorSettingVisible}
            placement="bottomRight"
          >
            <Button type="text" icon={<SettingOutlined />} size="small" title="设置标签颜色">
              颜色设置
            </Button>
          </Popover>
        </div>
      }
      open={open}
      onCancel={() => onCancel(false)}
      footer={null}
      width="90%"
      style={{ maxWidth: 1200, top: 20 }}
      styles={{
        body: { minHeight: '60vh', paddingTop: 24 },
      }}
      destroyOnClose
    >
      {generateTabStyles()}
      <Tabs
        tabPosition="left"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        tabBarStyle={{
          minWidth: 150,
          paddingLeft: 8,
          paddingRight: 12,
        }}
        className="colored-tabs"
      />
    </Modal>
  );
};

export default BotConfigManager;
