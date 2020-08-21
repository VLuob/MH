/**
 * 关注行为
 * @type {Object}
 */
export const ActionType = {
    FOCUS: 1,
    UNFOCUS: 0
}

/**
 * 喜欢类型
 */
export const FavorTypes = {
    // 作品
    SHOTS: 1,
    // 文章
    ARTICLE: 2,
    // 评论
    COMMENT: 3,
  }
  

/**
 * 关注类型
 */
export const FollowTypes = {
    // 作者
    AUTHOR: 1,
    // 标签
    TAG: 2,
    // 分类
    CLASSIFICATION: 3,
    // 品牌
    BRAND: 4,
    // 收藏夹
    COLLECTION: 5,
}

/**
 * 收藏类型
 */
export const CollectionTypes = {
    // 文章
    ARTICLE: 1,
    // 作品
    SHOTS: 2,
}

/**
 * 站内模块
 */
export const SiteModules = {
    // 作品
    SHOTS: 1,
    // 文章
    ARTICLE: 2,
    // 作者
    AUTHOR: 3,
}

/**
 * 列表排序类型 应用url参数
 */
export const CommonSortType = {
    // 推荐
    RECOMMEND: '1',
    // 最新
    NEWEST: '2',
    // 最热
    HOT: '3',
    // 关注
    FOLLOW: '4',
    // 相关
    MATCH: '5',
    // 服务
    SERVICE: '6',
    // 作品数
    SHOTS: '7',
}

/**
 * 产品增强类型
 */
export const ProductTipType = {
    // 气泡文字
    BUBBLE_TEXT: 1,
    // 标红
    MARK_RED: 2,
}