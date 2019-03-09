import { observable, action } from 'mobx'

export class GlobalStore {
    @observable
    title = ''

    @action
    changeTitle(title) {
        this.title = title
    }
}

export default new GlobalStore()

