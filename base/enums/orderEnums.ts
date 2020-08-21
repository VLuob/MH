
/**
 * 定价模式
 */
export const EditionScope = {
  // 版本套餐
  EDITION_PACKAGE: 1,
  // 增值服务
  ADDED_SERVICE: 2,
}

/**
* 版本类型
*/
export const EditionType = {
  FREE: 1,
  STANDARD: 2,
  ADVANCED: 3,
}


/**
* 增值服务类型
*/
export const AddedServiceType = {
  // 独立作品库官网
  HOME_PAGE: 1,
  // 独立作品库小程序
  MINI_APP: 2,
  // 高清视频上传
  UPLOAD_EXTEND: 3,
  // 公开作品扩容
  SHOTS_EXTEND: 4,
}

/**
 * 支付类型
 */
export const PayType = {
  // 支付宝支付
  ALIPAY: 1,
  // 微信支付
  WXPAY: 2,
  // 银行转账
  BANKPAY: 3,
}

/**
 * 交易订单状态
 */
export const OrderStatus = {
  // 未支付
  UNPAID: 0,
  // 已支付
  PAID: 1,
  // 取消订单
  CANCELLED: 2,
}

/**
 * 发票状态
 */
export const InvoiceStatus = {
  // 未申请
  NOT_APPLIED: 0,
  // 待处理
  PENDING: 1,
  // 已处理
  PROCESSED: 2,
  // 已配送
  DELIVERY: 3,
}

/**
 * 发票类型
 */
export const InvoiceType = {
  // 普通发票
  BASE: 1,
  // 增值税发票
  ADDED: 2,
}