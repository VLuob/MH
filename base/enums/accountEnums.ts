/**
 * 申请方式类型
 * @type {Object}
 */
export const ApplyType = {
    EMAIL: 'email_reset',
    PHONE: 'phone_reset'
}

export const MineType = {
    COMMENT: 'comment',
    FOLLOW: 'follow',
    MESSAGE: 'message',
    LETTER: 'letter',
    STATISTICS: 'statistics',
    CREATION: 'creation',
    CREATOR: 'creator',
    FAVOR: 'favorite',
    COLLECTION: 'collections',
    INSTITUTION: 'teams',
    NOTIFICATION: 'notification',
    DATAANDACCOUNT: 'account',
    CREATEINSTITUTION: 'createinstitution',
    LOGOUT: 'logout',
    // 订单与套餐
    ORDER: 'order',
    // 邮箱订阅
    SUBSCRIPTION: 'subscribe',
}

export const TeamMenuType = {
    CREATION: 'creation',
    SERVICE: 'service',
    STATISTICS: 'statistics',
    MEMBER: 'member',
    DATA: 'account',
    HOME_PAGE: 'home',
    WEBSITE: 'website',
}

/**
 * 发送短信验证码类型
 */
export const PhoneVerifyCodeType = {
    // 安全中心
    ACCOUNT: 1,
    // 创建创作者
    AUTHOR: 2,
    // 询价
    ENQUIRY: 5,
    // 其他验证
    OTHER: 6,
}