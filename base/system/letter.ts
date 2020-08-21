import { LetterSources } from '../enums'

const filters = {
  sourceMap: {
    [LetterSources.AUTHOR_DETAIL]: '创作者详情',
    [LetterSources.ARTICLE_DETAIL]: '文章详情页',
    [LetterSources.SHOTS_DETAIL]: '作品详情页',
    [LetterSources.AUTHOR_CARD]: '创作者迷你名片',
    [LetterSources.SYSTEM_NOTICE]: '系统通知',
    [LetterSources.SHOTS_WEBSITE]: '独立作品库官网',
    [LetterSources.TOP]: '榜单',
    [LetterSources.AUTHOR_LIST]: '创作者列表',
    [LetterSources.USER_CENTER_MESSAGE]: '个人中心-我的消息',
    [LetterSources.USER_CENTER_FOLLOW]: '个人中心-我的关注',
  },

}

export default { filters }