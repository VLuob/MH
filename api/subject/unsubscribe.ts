import { http, config } from '@utils'

// const api = config.API_MEIHUA

export default {
    /**
     * 退订邮箱
     */
    unsubscribe(option) {
        return http.get(`https://www.meihua.info/uSub`, option)
    },
}