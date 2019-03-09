import { routerStore } from 'stores'

/**
 * 默认的http请求配置， 默认显示错误信息提示
 */
export const DEFAULT_HTTP_OPTION = {
    withCredentials: false,
    isSuccess: res => res.status !== undefined && res.status !== null && Number(res.status) === 200,
    responseExtractor: res => res.data,
    responseFormatter: res => ({
        status: res.data.status,
        data: res.data.response || res.data.data,
        msg: res.data.msg || ''
    }),
    onError: err => {
        if (err.status === 402) {
            // TODO: use ui component instead
            alert('登录已过期，请重新登录')
            setTimeout(() => {
                // TODO: 可优化，returnUrl参数登录后跳回
                routerStore.push('/login')
            }, 300)
        } else {
            // TODO: use ui component instead
            alert('未知错误')
        }
    }
}

