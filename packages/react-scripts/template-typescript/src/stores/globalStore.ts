import { observable, action } from 'mobx'

export class GlobalStore {
   @observable
   title: string = ''

   @action
   changeTitle(title: string) {
       this.title = title
   }
}

export default new GlobalStore()

