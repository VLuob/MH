import { config, http } from '@utils'
import basic from '@base/system/basic'

const api = config.API_MEIHUA
const token = basic.token

export default {
    /**
     * 获取专题列表
     */
    queryTopics({...option}) {
        return http.get(`${api}/composition/feature`, option)
    },

    /**
     * 获取专题详情
     */
    queryTopic({id, ...option}) {


        return http.get(`${api}/composition/feature/${id}`, {token, id, ...option})
    },

    /**
     * 分页获取专题模块下面的作品、文章、创作者数据
     */
    queryTopicModuleContents({feature_id, module_id, ...option}) {
      return http.get(`${api}/composition/feature/${feature_id}/${module_id}`, {token, ...option})
    },

    /**
     * 获取专题统计
     */
    queryTopicStatistics() {
      return http.get(`${api}/composition/feature/statistics`)
    },
    
    /**
     * 获取专题分类列表
     */
    queryTopicClassifications({...option}) {
      return http.get(`${api}/composition/feature/classification`, option)
    },

    /**
     * 获取专题聚合列表
     */
    queryCompositionTopics({...option}) {
      return http.get(`${api}/composition/feature/collection`, option)
    }
}