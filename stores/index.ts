import { action, observable } from 'mobx'
import { useStaticRendering } from 'mobx-react'

import { HomeStore } from './home/homeStore'
import globalStore, { GlobalStore }  from './global/globalStore'
import adStore, { AdStore }  from './global/adStore'
import { ProductStore } from './global/productStore'
import accountStore, { AccountStore } from './account/accountStore'
import statisticsStore, { StatisticsStore } from './account/statisticsStore'
import messageStore, { MessageStore } from './account/messageStore'
import letterStore, { LetterStore } from './account/letterStore'
import followStore, { FollowStore } from './account/followStore'
import { OrderStore } from './account/orderStore'
import brandStore, { BrandStore } from './subject/brandStore'
import articlassifyStore, { ArticlassifyStore } from './subject/articlassifyStore'
import searchStore, { SearchStore } from './subject/searchStore'
import authorStore, { AuthorStore } from './author/authorStore'
import userCenterStore, { UserCenterStore } from './account/userCenterStore'
import compositionStore, { CompositionStore } from './composition/compositionStore'
import { DetailStore } from './composition/detailStore'
import { ShotsStore } from './composition/shotsStore'
import commentStore, { CommentStore } from './composition/commentStore'
import tagStore, { TagStore } from './tag/tagStore'
import topicStore, { TopicStore } from './topic/topicStore'
import topStore, { TopStore } from './top/topStore'
import { CollectionStore } from './collection/collectionStore'
import { EnquiryStore } from './enquiry/enquiryStore'
import { ServiceStore } from './service/serviceStore'

const isServer = !process.browser
    
useStaticRendering(isServer)

class Store {
    @observable globalStore?: GlobalStore
    @observable adStore?: AdStore
    @observable productStore?: ProductStore
    @observable homeStore?: HomeStore
    @observable authorStore?: AuthorStore   
    @observable searchStore?: SearchStore
    @observable accountStore?: AccountStore
    @observable statisticsStore?: StatisticsStore
    @observable messageStore?: MessageStore
    @observable letterStore?: LetterStore
    @observable followStore?: FollowStore
    @observable orderStore?: OrderStore
    @observable userCenterStore?: UserCenterStore
    @observable compositionStore?: CompositionStore
    @observable detailStore?: DetailStore
    @observable shotsStore?: ShotsStore
    @observable commentStore?: CommentStore
    @observable brandStore?: BrandStore
    @observable articlassifyStore?: ArticlassifyStore
    @observable tagStore?: TagStore
    @observable topicStore?: TopicStore
    @observable topStore?: TopStore
    @observable collectionStore?: CollectionStore
    @observable enquiryStore?: EnquiryStore
    @observable serviceStore?: ServiceStore

    constructor(isServer: boolean, initialData: any = {}) {
        this.accountStore = new AccountStore(initialData.accountStore)
        this.userCenterStore = new UserCenterStore(initialData.userCenterStore)
        this.statisticsStore = new StatisticsStore(initialData.statisticsStore)
        this.messageStore = new MessageStore(initialData.messageStore)
        this.letterStore = new LetterStore(initialData.letterStore)
        this.followStore = new FollowStore(initialData.followStore)
        this.orderStore = new OrderStore(initialData.orderStore)

        this.globalStore = new GlobalStore(initialData.globalStore)
        this.adStore = new AdStore(initialData.adStore)
        this.productStore = new ProductStore(initialData.productStore)
        this.homeStore = new HomeStore(initialData.homeStore)
        this.authorStore = new AuthorStore(initialData.authorStore)
        this.compositionStore = new CompositionStore(initialData.compositionStore)
        this.detailStore = new DetailStore(initialData.detailStore)
        this.shotsStore = new ShotsStore(initialData.shotsStore)
        this.commentStore = new CommentStore(initialData.commentStore)
        this.searchStore = new SearchStore(initialData.searchStore)
        this.brandStore = new BrandStore(initialData.brandStore)
        this.articlassifyStore = new ArticlassifyStore(initialData.articlassifyStore)
        this.tagStore = new TagStore(initialData.tagStore)
        this.topicStore = new TopicStore(initialData.topicStore)
        this.topStore = new TopStore(initialData.topStore)
        this.collectionStore = new CollectionStore(initialData.collectionStore)
        this.enquiryStore = new EnquiryStore(initialData.enquiryStore)
        this.serviceStore = new ServiceStore(initialData.serviceStore)
    }
}

let store = null


export function initializeStore(initialData: any={}) {
    // Always make a new store if server, otherwise state is shared between requests
    if(isServer) {
        return new Store(isServer, initialData)
    } 
    
    if(store === null) {
        store = new Store(isServer, initialData)
    }

    return store
}