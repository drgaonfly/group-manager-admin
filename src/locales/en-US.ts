import component from './en-US/component';
import globalHeader from './en-US/globalHeader';
import menu from './en-US/menu';
import pages from './en-US/pages';
import pwa from './en-US/pwa';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';
import app from './en-US/app';

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.preview.down.block': 'Download this page to your local project',
  'app.welcome.link.fetch-blocks': 'Get all block',
  'app.welcome.link.block-list': 'Quickly build standard, pages based on `block` development',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...app,
  ...pages,
  amount: 'Amount',
  rate: 'Rate',
  fixedRate: 'Fixed Rate',
  transactionType: 'Transaction Type',
  'transactionType.income': 'Income',
  'transactionType.issue': 'Issue',
  'enter.amount': 'Please enter amount',
  'enter.rate': 'Please enter rate',
  'enter.fixedRate': 'Please enter fixed rate',
  'select.transactionType': 'Please select transaction type',
};
