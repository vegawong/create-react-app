import * as React from 'react'
import { observer, inject } from 'mobx-react'

import styles from './style.module.css'

interface IMapProps {
    title: string
}
type IProps = Partial<IMapProps>

@inject(
    (store: AppStore.IRootStore): IMapProps => {
        return {
            title: store.globalStore.title
        }
    }
)
@observer
class Home extends React.Component<IProps> {
    render() {
        return (
            <div>
                <h1 className={styles.title}>Hello {this.props.title!}!</h1>
            </div>
        )
    }
}

export default Home

