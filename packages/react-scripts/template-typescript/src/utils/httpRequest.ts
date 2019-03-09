/**
 * axios封装的http请求
 *
 * 如无特殊情况， 请不要修改此模块
 */

import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import qs from 'qs'

export enum HTTPERRORTYPE {
    LOGICERROR,
    TIMEOUTERROR,
    NETWORKERROR
}

export interface IHttpError {
    msg: string
    type: string
    config: AxiosRequestConfig
    status?: number
}

export interface IHttpResponse<T = PlainObject> {
    status: number
    data: T
    msg?: string
}

const API_URL_PREFIX = process.env.REACT_APP_API_URL_PREFIX || ''

export interface IHttpRequestOptions {
    /**
     * 请求接口的path前缀，默认使用环境设置的apiUrlPrefix
     *
     * @type {string}
     * @memberof HttpRequestOptions
     */
    baseUrl?: string

    /**
     * 是否开启跨域cookies, 默认false
     *
     */
    withCredentials?: boolean

    /**
     * 请求结果格式化处理
     *
     */
    responseFormatter?: <T>(res: AxiosResponse<any>) => IHttpResponse<T>

    /**
     * 请求结果提取，目的在于去掉status，msg等辅助字段，提取逻辑数据
     * 默认不设置则原结果返回
     *
     */
    responseExtractor?: <T>(httpResponse: IHttpResponse) => T

    /**
     * 获取请求结果的逻辑状态
     * 默认不设置，则返回res.code
     *
     */
    responseStatusGetter?: (res: IHttpResponse) => number

    /**
     * 判断请求结果是否是预计正确处理的返回
     * 默认判断属性code === 1
     * 如果不需要判断， 请设置: () => true
     *
     */
    isSuccess?: (res: IHttpResponse) => boolean

    /**
     * 错误回调， 默认不做任何处理
     *
     * @memberof HttpRequestOptions
     */
    onError?: (error: IHttpError) => any
}

export type IHttpRequestAction = <T = PlainObject>(
    url: string,
    data: PlainObject,
    options?: IHttpRequestOptions
) => Promise<T>

const http: {
    get?: IHttpRequestAction
    post?: IHttpRequestAction
    put?: IHttpRequestAction
    delete?: IHttpRequestAction
} = {}

const defaultResponseFormatter = (res: AxiosResponse<any>) => {
    const data = res.data || {}
    return {
        status: data.code,
        data: data.response || data.data,
        msg: data.msg || ''
    }
}
const defaultIsSuccess = (res: IHttpResponse) => Number(res.status === 1)
const defaultGetResponseStatus = (res: IHttpResponse) => Number(res.status)
const defaultResponseExtractor = (res: IHttpResponse) => res

type Methods = ['get', 'post', 'put', 'delete']
const methods: Methods = ['get', 'post', 'put', 'delete']

const requestInstance = axios.create()

// 创建axios实例，配置全局追加请求参数
requestInstance.interceptors.request.use(
    (cfg: AxiosRequestConfig) => {
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
        const errorDetail: IHttpError = {
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
    http[method] = async <T>(url: string, data: PlainObject, options?: IHttpRequestOptions) => {
        const opts: IHttpRequestOptions = Object.assign(
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

        const axiosConfig: AxiosRequestConfig = {
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
            .then<T>(response => {
                let rdata: IHttpResponse<T>
                if (
                    typeof response.data === 'object' &&
                    Array.isArray(response.data)
                ) {
                    // 防止php接口返回数组而不是对象
                    return Promise.reject({
                        msg: '接口返回的格式不能为数组',
                        status: 501,
                        type: HTTPERRORTYPE[HTTPERRORTYPE.LOGICERROR],
                        config: response.config
                    })
                } else {
                    rdata = opts.responseFormatter!(response)
                }
                if (!opts.isSuccess!(rdata)) {
                    const errorDetail: IHttpError = {
                        msg: rdata.msg || '',
                        status: opts.responseStatusGetter!(rdata),
                        type: HTTPERRORTYPE[HTTPERRORTYPE.LOGICERROR],
                        config: response.config
                    }
                    return Promise.reject(errorDetail)
                }
                return opts.responseExtractor!(rdata)
            })
            .catch((err: IHttpError) => {
                if (opts.onError) {
                    opts.onError!(err)
                }
                return Promise.reject(err)
            })
    }
})

export default http
