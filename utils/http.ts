import axios from 'axios'
import qs from 'qs'

import { cookie } from '@utils'
import * as config from './config'
import { message } from 'antd'
import jsCookie from 'js-cookie'

/**
 * @param  {Error}
 * @return {[type]}
 */
const catchError = (error) => {
    if(error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
        message.destroy()
        message.error('服务器响应错误')
    } else if(error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
        message.destroy()
        message.error('网络请求错误')
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message)
        message.destroy()
        message.error('网络请求过程发生错误')
    }
    console.log(error.config)
}

/**
 * 检测用户Token是否有效 
 * @param  {Object} data 服务端返回数据
 */
const checkInvalidToken = (data={}, option, url, reject) => {
    if(data.code === 'E100000' && (data.msg === 'token信息错误' || data.msg === 'Error Token' || data.msg === 'ERROR TOKEN')) {
        if(typeof window !== 'undefined') {
            const hosts = window.location.host && (window.location.host).split('.')[0]
            const cookieParam = { 
                path: '/', 
                // domain: hosts !== 'www' ? hosts + config.COOKIE_MEIHUA_DOMAIN : config.COOKIE_MEIHUA_DOMAIN, 
                domain: config.COOKIE_MEIHUA_DOMAIN,
            }

            cookie.remove(config.COOKIE_MEIHUA_TOKEN, cookieParam)
            cookie.remove('mhauthorization', cookieParam)
        }
    }
    return
}

export default {
    get(url, data) {
        return new Promise((resolve, reject) => {
            axios.get(url, { params: data })
                .then(result => {
                    if(result.data) {
                        // if(!result.data.success) {
                        //     checkInvalidToken(result.data.data, data, url, reject)
                        // }

                        resolve(result.data)
                    } else {
                        reject(result.data || result)
                    }
                })
                .catch(error => {
                    reject(error)
                })
        })
    },

    post(url, data) {
        return new Promise((resolve, reject) => {
            axios.post(url, qs.stringify(data))
                .then(result => {
                    if(result.data) {
                        // if(!result.data.success) {
                        //     checkInvalidToken(result.data.data, data, url, reject)
                        // }

                        resolve(result.data)
                    } else {
                        reject(result.data || result)
                    }
                })
                .catch(error => {
                    reject(error)
                })
        })
    },

    postFormData(url, data, config) {
        return new Promise((resolve, reject) => {
            axios.post(url, data, { headers: { 'Content-Type': 'multipart/form-data' }, ...config })
                .then(result => {
                    if(result.data) {
                        // if(!result.data.success) {
                        //     checkInvalidToken(result.data.data, data, url, reject)
                        // }

                        resolve(result.data)
                    } else {
                        reject(result.data || result)
                    }
                })
                .catch(error => {
                    reject(error)
                })
        })
    },

    delete(url, data) {
        return new Promise((resolve, reject) => {
            axios.delete(url, { params: data })
                .then(result => {
                    if(result.data) {
                        // if(!result.data.success) {
                        //     checkInvalidToken(result.data.data, data, url, reject)
                        // }

                        resolve(result.data)
                    } else {
                        reject(result.data || result)
                    }
                })
                .catch(error => {
                    // catchError(error)
                    if(typeof window !== 'undefined') {
                        message.destroy()
                        error && message.error(error)
                    }

                    reject(error)
                })
        })
    },

    put(url, data) {
        return new Promise((resolve, reject) => {
            axios.put(url, qs.stringify(data))
                .then(result => {
                    if (result.data) {
                        // if (!result.data.success) {
                        //     checkInvalidToken(result.data.data, data, url, reject)
                        // }

                        resolve(result.data)
                    } else {
                        reject(result.data || result)
                    }
                })
                .catch(error => {
                    reject(error)
                })
        })
    },

    ajax(option) {
        return new Promise((resolve, reject) => {
            axios(option)
                .then(result => {
                    if(result.data) {
                        // if (!result.data.success) {
                        //     checkInvalidToken(result.data.data, option.data, option.url, reject)
                        // }

                        resolve(result.data)
                    } else {
                        reject(result.data || result)
                    }
                })
                .catch(error => {
                    reject(error)
                })
        })
    },
    all(...args) {
        return new Promise((resolve, reject) => {
            axios.all([...args])
                .then(axios.spread((...params) => {
                    resolve(params)
                }))
                .catch(error => {
                    reject(error)
                })
        })
    }
}
