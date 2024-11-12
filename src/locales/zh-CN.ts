import component from './zh-CN/component';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pages from './zh-CN/pages';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';
import app from './zh-CN/app';

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.preview.down.block': '下载此页面到本地项目',
  'app.welcome.link.fetch-blocks': '获取全部区块',
  'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',
  ...pages,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...app,
  amount: '金额',
  rate: '费率',
  fixedRate: '固定汇率',
  transactionType: '交易类型',
  'transactionType.income': '收入',
  'transactionType.issue': '支出',
  createdAt: '创建时间',
  updatedAt: '更新时间',

  // 表单提示文字
  'enter.amount': '请输入金额',
  'enter.rate': '请输入费率',
  'enter.fixedRate': '请输入固定汇率',
  'select.transactionType': '请选择交易类型',
};
