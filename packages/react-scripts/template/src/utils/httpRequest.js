/**
 * axios封装的http请求
 *
 * 如无特殊情况， 请不要修改此模块
 */

import axios from 'axios'
import qs from 'qs'

export const HTTPERRORTYPE = {
    LOGICERROR: 'LOGICERROR',
    TIMEOUTERROR: 'TIMEOUTERROR',
    NETWORKERROR: 'NETWORKERROR'
}

const API_URL_PREFIX = process.env.REACT_APP_API_URL_PREFIX || ''

const http = {}

const defaultResponseFormatter = res => {
    const data = res.data || {}
    return {
        status: data.code,
        data: data.response || data.data,
        msg: data.msg || ''
    }
}
const defaultIsSuccess = res => Number(res.status === 1)
const defaultGetResponseStatus = res => Number(res.status)
const defaultResponseExtractor = res => res

const methods = ['get', 'post', 'put', 'delete']

const requestInstance = axios.create()

// 创建axios实例，配置全局追加请求参数
requestInstance.interceptors.request.use(
    cfg => {
        const ts = Date.now() / 1000
        const queryData = {
            ts
        }
        cfg.params = Object.assign({}, cfg.params || {}, queryData)
        return cfg
    },
    error => Promise.reject(error)
)

// 全局请求错误拦截
requestInstance.interceptors.response.use(
    response => {
        return response
    },
    error => {
        const errorDetail = {
            msg: error.message || '网络故障',
            type: /^timeout of/.test(error.message) ? HTTPERRORTYPE.TIMEOUTERROR : HTTPERRORTYPE.NETWORKERROR,
            config: error.config
        }
        return Promise.reject(errorDetail)
    }
)

methods.forEach(method => {
    http[method] = async (url, data, options?) => {
        const opts = Object.assign(
            {
                baseUrl: API_URL_PREFIX, // 默认apiUrl前缀使用环境配置，特殊接口可以通过httpRequestOptions覆盖
                formatResponse: true,
                withCredentials: false,
                isSuccess: defaultIsSuccess,
                responseFormatter: defaultResponseFormatter,
                responseExtractor: defaultResponseExtractor,
                responseStatusGetter: defaultGetResponseStatus
            },
            options || {}
        )

        const axiosConfig = {
            method,
            url,
            baseURL: opts.baseUrl,
            withCredentials: opts.withCredentials
        }

        // 参数传递方式
        if (method === 'get') {
            axiosConfig.params = data
        } else if (data instanceof FormData) {
            axiosConfig.data = data
        } else {
            axiosConfig.data = qs.stringify(data)
        }

        return requestInstance
            .request(axiosConfig)
            .then(response => {
                let rdata
                if (typeof response.data === 'object' && Array.isArray(response.data)) {
                    // 防止php接口返回数组而不是对象
                    return Promise.reject({
                        msg: '接口返回的格式不能为数组',
                        status: 501,
                        type: HTTPERRORTYPE.LOGICERROR,
                        config: response.config
                    })
                } else {
                    rdata = opts.responseFormatter(response)
                }
                if (!opts.isSuccess(rdata)) {
                    const errorDetail = {
                        msg: rdata.msg || '',
                        status: opts.responseStatusGetter(rdata),
                        type: HTTPERRORTYPE.LOGICERROR,
                        config: response.config
                    }
                    return Promise.reject(errorDetail)
                }
                return opts.responseExtractor(rdata)
            })
            .catch(err => {
                if (opts.onError) {
                    opts.onError(err)
                }
                return Promise.reject(err)
            })
    }
})

export default http

