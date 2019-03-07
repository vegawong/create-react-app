import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import { configure } from 'mobx'
import createHashHistory from 'history/createHashHistory'
import { syncHistoryWithStore } from 'mobx-react-router'
import { Router } from 'react-router-dom'
import * as serviceWorker from './serviceWorker'


// Import root app
import App from 'containers/shared/App'

import * as store from './stores'

// 开启mobx严格模式
configure({ enforceActions: true })

const hashHistory = createHashHistory()
const history = syncHistoryWithStore(hashHistory, store.routerStore)

const MOUNT_NODE = document.getElementById('root') as Element

const render = (Component: React.ComponentType) => {
    ReactDOM.render(
        <Provider {...store}>
            <Router history={history}>
                <Component />
            </Router>
        </Provider>,
        MOUNT_NODE
    )
}

render(App)

if (module.hot) {
    // 热更新React Components
    // module.hot.accept不支持动态的依赖
    // 必须是编译时定义的常量
    module.hot.accept(['containers/shared/App'], () => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE)
        render(require('containers/shared/App').default)
    })
}

// TODO: 待验证
// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
if (process.env.NODE_ENV === 'production') {
    // tslint:disable-next-line:no-var-requires
    require('offline-plugin/runtime').install() // eslint-disable-line global-require
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

