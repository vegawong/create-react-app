import http from 'utils/httpRequest'
import { DEFAULT_HTTP_OPTION } from './conf'

export async function login(params: PlainObject) {
    return http.post!(
        '/sys/user/login',
        {
            username: params.username || '',
            password: params.password || ''
        },
        DEFAULT_HTTP_OPTION
    )
}

