/**
 * 发布类型
 * @type {Object}
 */
export const CompositionTypes = {
    // 文章
    ARTICLE: 1,
    // 作品
    SHOTS: 2,
}

/**
 * 创作状态
 */
export const CompositionStatus = {
  // 草稿
  DRAFT: 1,
  // 审核中
  AUDITING: 2,
  // 审核通过
  PASSED: 3,
  // 关闭
  CLOSED: 4,
}

/**
 * 相关创作内容包含范围
 */
export const RelatedCompositionScope = {
  // 包含图片
  IMAGE: 1,
  // 包含视频
  VIDEO: 2,
  // 全部
  ALL: 3
}


/**
 * 下载权限类型
 */
export const DownloadAuthTypes = {
    // 普通用户
    GENERAL: 1,
    // vip用户
    VIP: 2,
  }
  
  /**
   * 下载权限状态
   */
  export const DownloadAuthStatus = {
    // 开启
    OPENED: 1,
    // 未开启
    CLOSED: 2,
  }


export const UploadFileTypes = {
  // 附件
  ATTACHMENT: 1,
  // 作品图片
  WORKS_IMAGE: 2,
  // 作品视频
  WORKS_VIDEO: 3,
}

/**
 * 分类类型
 */
export const ClassificationTypes = {
  // 分类
  NORMAL: 1,
  // 品类
  CATEGORY: 2,
  // 形式
  FORM: 3,
  // 专题
  TOPIC: 4,
}

/**
 *  热门文章类型
 */
export const HotTypes = {
  // 按周
  WEEK: 1,
  // 按月
  MONTH: 2,
}
