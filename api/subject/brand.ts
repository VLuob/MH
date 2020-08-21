import { http, config } from '@utils'

const api = config.API_MEIHUA

export default {
    /**
     * 获取品牌详情
     * @return {[type]} [description]
     */
    brandDetail(option) {
        return http.get(`${api}/composition/composition/brand/${option.brandId}`, option)
    },
    /**
     * 获取品牌主详情
     * @return {[type]} [description]
     */
    queryBrandOwner({host, brandId, ...option}) {
        return http.get(`${api}/composition/composition/brand/${brandId}/author`, option)
    },
}