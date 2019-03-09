import http from 'utils/httpRequest'
import { DEFAULT_HTTP_OPTION } from './conf'
import md5 from 'blueimp-md5'

export async function login(params: PlainObject) {
    return http.post!(
        '/sys/user/login',
        {
            username: params.username || '',
            password: params.password ? md5(params.password) : ''
        },
        DEFAULT_HTTP_OPTION
    )
}

