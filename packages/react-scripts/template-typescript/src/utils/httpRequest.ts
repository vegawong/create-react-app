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

export interface IError {
    msg: string
    type: string
    config: AxiosRequestConfig
    status?: number
}

export interface IResponse<T = IPlainObject> {
    status: number
    data: T
    msg?: string
}

export interface IRequestOption {
    /**
     * 请求接口的path前缀，默认使用环境设置的apiUrlPrefix
     *
     */
    baseUrl?: string

    /**
     * 非get请求下请求参数的格式化处理，默认使用qs处理
     * 如果需要以json方式传递参数，返回对象格式即可
     */
    requestBodyFormatter?: (formData: any) => any

    /**
     * 是否开启跨域cookies, 默认false
     *
     */
    withCredentials?: boolean

    /**
     * 请求结果格式化处理
     *
     */
    responseFormatter?: <T>(axiosRes: AxiosResponse<any>) => IResponse<T>

    /**
     * 是否提取返回对象中的数据字段
     * Default: true
     */
    isExtractor?: boolean

    /**
     * 判断请求结果是否是预计正确处理的返回
     * 默认判断属性code === 1
     * 如果不需要判断， 请设置: () => true
     *
     */
    isSuccess?: (res: IResponse) => boolean

    /**
     * 错误回调， 默认不做任何处理
     *
     */
    onError?: (error: IError) => any

    /**
     * 请求头
     * Default: {}
     */
    headers?: IPlainObject
}

const defaultOptions: IRequestOption = {
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

export type IHttpRequestAction = <T = IPlainObject>(
    url: string,
    data: IPlainObject,
    options?: IRequestOption
) => Promise<T | IResponse<T>>

const http: {
    get?: IHttpRequestAction
    post?: IHttpRequestAction
    put?: IHttpRequestAction
    delete?: IHttpRequestAction
} = {}

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
        if (error.response) {
            return Promise.resolve(error.response)
        }
        const errorDetail: IError = {
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
    http[method] = async <T>(url: string, data: IPlainObject, options?: IRequestOption) => {
        const opts: IRequestOption = Object.assign({}, defaultOptions, options || {})

        const axiosConfig: AxiosRequestConfig = {
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
            axiosConfig.data = opts.requestBodyFormatter!(data)
        }

        return requestInstance
            .request(axiosConfig)
            .then<T | IResponse<T>>(response => {
                let rdata: IResponse<T>
                if (typeof response.data === 'object' && Array.isArray(response.data)) {
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
                    const errorDetail: IError = {
                        msg: rdata.msg || '',
                        status: rdata.status,
                        type: HTTPERRORTYPE[HTTPERRORTYPE.LOGICERROR],
                        config: response.config
                    }
                    return Promise.reject(errorDetail)
                }
                return !!opts.isExtractor ? rdata.data : rdata
            })
            .catch((err: IError) => {
                if (opts.onError) {
                    opts.onError!(err)
                }
                return Promise.reject(err)
            })
    }
})

export default http

