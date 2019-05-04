import { IResponse, IRequestOption, IError } from 'utils/httpRequest'
import { AxiosResponse } from 'axios'


/**
 * 默认的http请求配置， 默认显示错误信息提示
 */
export const DEFAULT_HTTP_OPTION: IRequestOption = {
    withCredentials: false,
    isSuccess: (res: IResponse) => res.status !== undefined && res.status !== null && Number(res.status) === 200,
    // TODO: 格式化您与后端约定对接的数据返回格式
    responseFormatter: (res: AxiosResponse<any>) => ({
        status: res.data.code,
        data: res.data.response || res.data.data,
        msg: res.data.message || ''
    }),
    onError: async (err: IError) => {
        // TODO: 用您希望的提示方式提示错误
        alert(err.msg)
    }
}

