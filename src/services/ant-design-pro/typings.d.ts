// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    isOnline: boolean;
    isAdmin: CurrentUser | true;
    data?: any;
    name?: string;
    avatar?: string;
    role?: string;
    roles?: any;
    _id?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    twoFAEnabled?: boolean;
    address?: string;
    phone?: string;
    balance?: number;
    serviceLink?: string;
    serviceLinks?: string;
    bidirectional?: boolean;
    groupMessage?: boolean;
    keyboardConfig?: boolean;
    speech_static?: boolean;
    availableBotCount?: number;
    botCount?: number;
    groupWelcome?: boolean;
    channelPost?: boolean;
    groupVerify?: boolean;
    reportGroupMemberNameUpdated?: boolean;
    replyRule?: boolean;
    checkinRule?: boolean;
    lotteryRule?: boolean;
    auctionRule?: boolean;
    adRemoval?: boolean;
    rankConferral?: boolean;
    recharge?: boolean;
    success?: boolean;
    redPacket?: boolean;
  };

  // Example type definition

  type ItemData = {
    [x: string]: any;
    [x: string]: boolean;
    code?: string;
    operations?: any;
    isReviewed?: boolean;
    isSigned?: boolean;
    bill?: any;
    afterSales?: boolean;
    isAbnormal?: boolean;
    priceList?: any;
    accountLibraries?: any;
    data?: any;
    isProcessed?: boolean;
    orderNumber?: string;
    bills?: any[];
    uploadedFile?: string;
    file?: string;
    user?: any;
    resourceUrl?: any;
    category?: any;
    imageUrl?: string;
    title?: string;
    email?: string;
    _id?: string;
    types?: string;
    userinfo?: any;
    account?: string;
    id?: number;
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number | string;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
    videoUrl?: string[];
    balance?: number;
  };

  type ResData = {
    /** 列表的内容总数 */
    code?: number;
    data?: any;
    msg?: string;
  };

  type ResponseData = {
    /** 列表的内容总数 */
    data?: any;
    success?: boolean;
    message?: string;
  };

  type DataList = {
    data?: ListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type ListItem = {
    id?: number;
    _id?: string;
    name?: string;
    createdAt?: string;
    updatedAt?: string;
    isOnline?: boolean;
  };

  type LoginResult = {
    refreshToken?: string;
    success?: boolean;
    token?: string;
    requires2FA?: boolean;
    sessionId?: string;
  };

  type RefreshResult = {
    refreshToken: string;
    success: boolean;
    token: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
    token?: string;
  };

  type RuleList = {
    data?: ItemData[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    email?: string;
    password?: string;
    token?: string;
  };

  type refreshParams = {
    refreshToken: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  export type CustomerListItem = {
    _id: string;
    session?: string;
    cookies?: string[];
    ip?: string;
    remarks?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}
