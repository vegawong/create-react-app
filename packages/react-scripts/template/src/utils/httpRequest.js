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
const defaultOptions = {
    baseUrl: process.env.REACT_APP_API_URL_PREFIX,
    requestBodyFormatter: formData => qs.stringify(formData),
    withCredentials: false,
    responseFormatter: axiosRes => {
        const data = axiosRes.data || {}
        return {
            status: data.code,
            data: data.response || data.data,
            msg: data.msg
        }
    },
    isExtractor: true,
    isSuccess: res => Number(res.status) === 1,
    onError: () => null,
    headers: {}
}

const http = {}

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
        if (error.response) {
            return Promise.resolve(error.response)
        }
        const errorDetail = {
            msg: error.message || '网络故障',
            type: /^timeout of/.test(error.message)
                ? HTTPERRORTYPE[HTTPERRORTYPE.TIMEOUTERROR]
                : HTTPERRORTYPE[HTTPERRORTYPE.NETWORKERROR],
            config: error.config
        }
        return Promise.reject(errorDetail)
    }
)

methods.forEach(method => {
    http[method] = async (url, data, options) => {
        const opts = Object.assign({}, defaultOptions, options || {})

        const axiosConfig = {
            method,
            url,
            baseURL: opts.baseUrl,
            withCredentials: opts.withCredentials,
            headers: opts.headers
        }

        // 参数传递方式
        if (method === 'get') {
            axiosConfig.params = data
        } else if (data instanceof FormData) {
            axiosConfig.data = data
        } else {
            axiosConfig.data = opts.requestBodyFormatter(data)
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
                        type: HTTPERRORTYPE[HTTPERRORTYPE.LOGICERROR],
                        config: response.config
                    })
                } else {
                    rdata = opts.responseFormatter(response)
                }
                if (!opts.isSuccess(rdata)) {
                    const errorDetail = {
                        msg: rdata.msg || '',
                        status: rdata.status,
                        type: HTTPERRORTYPE[HTTPERRORTYPE.LOGICERROR],
                        config: response.config
                    }
                    return Promise.reject(errorDetail)
                }
                return !!opts.isExtractor ? rdata.data : rdata
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
