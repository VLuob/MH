/**
 * 作者数字类型
 * @type {Object}
 */
export const AuthorType = {
    PERSONAL: 1,
    INSTITUTION: 2,
    BRANDER: 2,
    SERVER: 3,
    EDITOR: 4
}
/**
 * 创作者审核状态
 * @type {Object}
 */
export const AuthorStatus = {
    AUDITING: 0,
    PASSED: 1,
    REFUSED: 2,
    CLOSED: 3,
    UPDATE_AUDITING: 4
}
/**
 * 作品类型
 * @type {Object}
 */
export const CompositionType = {
    ARTICLE: 1,
    COMPOSITION: 2
}
/**
 * 作者类型
 * @type {Object}
 */
export const ClassificationType = {
    SPECIAL: 0,
    NORMAL: 1
}
/**
 * 关注类型
 * @type {Object}
 */
export const FocusType = {
    AUTHOR: 1,
    TAG: 2,
    CLASSIFY: 3,
    BRAND: 4
}
