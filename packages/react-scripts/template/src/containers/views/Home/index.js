import * as React from 'react'
import { observer, inject } from 'mobx-react'

import styles from './style.module.css'

@inject(store => {
    return {
        title: store.globalStore.title
    }
})
@observer
class Home extends React.Component {
    render() { return (
            <div>
                <h1 className={styles.title}>Hello {this.props.title}!</h1>
            </div>
        )
    }
}

export default Home

