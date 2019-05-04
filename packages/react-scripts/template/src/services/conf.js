/**
 * 默认的http请求配置， 默认显示错误信息提示
 */
export const DEFAULT_HTTP_OPTION = {
    withCredentials: false,
    isSuccess: res => res.status !== undefined && res.status !== null && Number(res.status) === 200,
    // TODO: 格式化您与后端约定对接的数据返回格式
    responseFormatter: res => ({
        status: res.data.code,
        data: res.data.response || res.data.data,
        msg: res.data.message || ''
    }),
    onError: async err => {
        // TODO: 用您希望的提示方式提示错误
        alert(err.msg)
    }
}
