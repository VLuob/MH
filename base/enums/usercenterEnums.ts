/**
 * 获取邮件,功能,域名设置类型
 * @type {Object}
 */
export const FuncType = {
  WATERMARK: 1,
  DOMAIN: 2,
  EMAIL: 3,
}
/**
 * 手机类型
 * @type {Object}
 */
export const PhoneType = {
  OLDPHONE: 1,
  NEWPHONE: 2,
}
/**
 * 作品类型
 * @type {Object}
 */
export const InsComType = {
  INS: 0,
  MEMBER: 1,
  INSSHOW: 2
}
/**
 * 机构设置
 * @type {Object}
 */
export const InsSetType = {
  INITIAL: 0,
  PROSERVER: 1,
  SERVERCUS: 2,
  FUNCTION: 3,
  DOMAIN: 4,
  EMAILSUB: 5
}

/**
 * 创作者管理资料与账户TAB路由
 */
export const AuthorManageBaseTab = {
  INFO: 'info',
  SUBSCRIBE: 'subscribe',
  DOMAIN: 'domain',
  WATERMARK: 'watermark',
}
/**
 * 成员角色类型
 * @type {Object}
 */
export const RoleType = {
  MANAGER: 1,
  OPERATOR: 2,
  AUTHOR: 3,
  CREATOR: 4
}
/**
 * 设置关注类型
 * @type {Object}
 */
export const SettingFocusType = {
  COMPOSITION: 0,
  ARTICLE: 1,
  FOCUS: 2,
  TAG: 3
}
/**
 * 设置操作文章作品信息类型
 * @type {Object}
 */
export const OperateCompositionType = {
  EDIT: 0,
  DELETE: 1,
  HIDDEN: 2,
  SHOW: 3
}
/**
 * 创作状态
 * @type {Object}
 */
export const CreationType = {
  DRAFT: 1,
  AUDITED: 2,
  PASS: 3,
  CLOSED: 4,
  REJECT: 5
}
/**
 * 创作显示状态
 * @type {Object}
 */
export const CreationShowType = {
  SHOW: 1,
  HIDDEN: 0
}
/**
 * 创作操作
 * @type {Object}
 */
export const CompositionOperateType = {
  EDIT: 0,
  DELETE: 1,
  REMOVE: 2,
  MARK: 3
}


/**
 * 统计类型范围
 */
export const StatisticsScope = {
  // 创作者主页浏览量
  AUTHOR_VIEWS: 1,
  // 创作者粉丝量
  AUTHOR_FANS: 2,
  // 作品浏览量
  SHOTS_VIEWS: 3,
  // 作品喜欢量
  SHOTS_FAVOR: 4,
  // 作品收藏量
  SHOTS_COLLECTION: 5,
  // 作品评论量
  SHOTS_COMMENT: 6,
  // 文章浏览量
  ARTICLE_VIEWS: 7,
  // 曝光量
  SHOTS_EXPOSURE: 8,
  // 文章喜欢数
  ARTICLE_FAVOR: 9,
  // 文章收藏量
  ARTICLE_COLLECTION: 10,
  // 文章评论量
  ARTICLE_COMMENT: 11,
  // 创作者周榜
  AUTHOR_WEEK_RANK: 12,
  // 创作者总榜
  AUTHOR_TOTAL_RANK: 13,
  // 创作者热度榜
  AUTHOR_HOT_RANK: 14,
}

/**
 * 创作者统计类型
 */
export const StatisticsType = {
  // 作品
  SHOTS: 1,
  // 文章
  ARTICLE: 2,
  // 创作者主页
  AUTHOR: 3,
}

/**
 * 消息类型
 */
export const MessageType = {
  ALL: 0,
  COMMENT: 1,
  FAVOR: 2,
  FOLLOW: 3,
  COLLECTION: 4,
  NOTICE: 5,
}

/**
 * 系统通知类型
 */
export const NoticeType = {
  AUTHOR_PASSED: 6,
  AUTHOR_REFUSE: 7,
  SHOTS_PASSED: 8,
  SHOTS_REFUSE: 9,
  ARTICLE_PASSED: 10,
  ARTICLE_REFUSE: 11,
  // 后台群发消息
  SYSTEM_GROUP_SEND: 14,
  // 公开询价审核通知
  ENQUIRY_AUDIT: 15,
  // 审核服务通知
  SERVICE_AUDIT: 16,
}

/**
 * 私信来源
 */
export const LetterSources = {
  // 创作者主页
  AUTHOR_DETAIL: 1,
  // 文章详情页
  ARTICLE_DETAIL: 2,
  // 作品详情页
  SHOTS_DETAIL: 3,
  // 创作者迷你名片
  AUTHOR_CARD: 4,
  // 系统通知
  SYSTEM_NOTICE: 5,
  // 独立作品库官网
  SHOTS_WEBSITE: 6,
  // 榜单
  TOP: 7,
  // 创作者列表
  AUTHOR_LIST: 8,
  // 个人中心-我的消息
  USER_CENTER_MESSAGE: 9,
  // 个人中心-我的关注
  USER_CENTER_FOLLOW: 10,
  // 公开询价
  PUBLIC_ENQUIRY: 11,
  // 服务
  SERVICE: 12
}

/**
 * 访问来源页面
 */
export const VisitReferrer = {
  meihua: 1,
  MEIHUA: 1,

  baidu_sem: 2,
  BAIDU_SEM: 2,

  baidu_seo: 3,
  BAIDU_SEO: 3,

}

/**
 * 私信状态
 */
export const LetterStatus = {
  // 拒绝
  REFUSED: 0,
  // 待审核
  AUDITING: 1,
  // 已发送
  SENT: 2,
}

/**
 * 私信发送类型
 */
export const LetterSendType = {
  // 发送
  SEND: 1,
  // 回复
  REPLY: 2,
}

/**
 * 询价发送人类型
 */
export const LetterSenderTypes = {
  // 用户发送
  USER: 1,
  // 创作者发送
  AUTHOR: 2,
  // 游客
  VISTOR: 3,
}

/**
 * 私信接收人类型
 */
export const LetterReceiverTypes = {
  // 用户接收
  USER: 1,
  // 创作者接收
  AUTHOR: 2,
}
/**
 * 对话详情类型
 */
export const LetterDetailType = {
  //   询价
  ENQUIRY: 1,
  //   群发消息
  NOTICE: 2
}

/**
 * 水印类型
 */
export const WatermarkType = {
  IMAGE: 1,
  VIDEO: 2,
}

/**
 * 水印位置
 */
export const WatermarkPosition = {
  LEFT: 1,
  CENTER: 2,
  RIGHT: 3,
}

/**
 * 邮件订阅类型
 */
export const EmailSubscribeType = {
  // 作品文章统计
  STATISTICS: 1,
  // 作品文章内容精选
  CONTENT: 2,
  // 收藏夹统计
  COLLECTION: 3,
  // 榜单收录统计
  RANKING: 4,
}