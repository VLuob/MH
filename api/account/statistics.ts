import { config, http } from '@utils'
import basic from '@base/system/basic'

const srvutils = require('@utils/srvutils')

const token = basic.token
const api = config.API_MEIHUA

export default {

  queryStatisticsAdditions(option) {
    return http.get(`${api}/composition/statistics/additions`, {token, ...option})
  },

  queryStatisticsTrend(option) {
    return http.get(`${api}/composition/statistics/additions/trend`, {token, ...option})
  },

  queryStatisticsDetail(option) {
    return http.get(`${api}/composition/statistics/additions/detail`, {token, ...option})
  },
}