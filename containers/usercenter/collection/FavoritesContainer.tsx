import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import dynamic from 'next/dynamic'

import { Tabs, Icon, message, Modal } from 'antd'

import EditFavoritesModal from '@containers/collection/EditFavoritesModal'
import PartLoading from '@components/features/PartLoading'


const FavoritesBoxNoSSR = dynamic(() => import('./FavoritesBox'), {loading: () => <PartLoading />, ssr: false})

const { TabPane } = Tabs

@inject(stores => {
  const { collectionStore } = stores.store
  return {
    collectionStore,
  }
})
@observer
export default class FavoritesContainer extends Component {
  state = {
    editVisible: false,
    recordValue: null,
  }

  handleEditVisible = (flag=false, recordValue=null) => {
    this.setState({editVisible: flag, recordValue})
  }

  handleEditSubmit = (values) => {
    const { collectionStore } = this.props
    const resultFn = res => {
        if (res.success) {
            this.handleEditVisible(false)
        } else {
            message.error(res.data.msg)
        }
    }

    if (!values.id) {
        collectionStore.addFavorites(values).then(resultFn)
    } else {
        collectionStore.editFavorites(values).then(resultFn)
    }
  }

  handleDelete = (record) => {
    Modal.confirm({
      title: '删除收藏夹',
      content: '确认删除该收藏夹？收藏内容也将会同步移除',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: {className: 'themes'},
      onOk: () => {
        const { collectionStore } = this.props
        collectionStore.deleteFavorites({id: record.id})
      }
    })
  }

  render() {
    const { editVisible, recordValue } = this.state
    return (
        <>
        <div className='common-container user-favorites'>
            <Tabs 
                className='user-tabs' 
                size='large' 
                defaultActiveKey="favorites" 
                animated={false} 
                tabBarExtraContent={<a className="text-create" onClick={e => this.handleEditVisible(true)}>创建收藏夹</a>}
            >
              <TabPane tab="我的收藏夹" key="favorites">
                <FavoritesBoxNoSSR 
                  onEdit={record => this.handleEditVisible(true, record)} 
                  onDelete={this.handleDelete}
                />
              </TabPane>
            </Tabs>
        </div>
        {editVisible && <EditFavoritesModal 
          visible={editVisible}
          values={recordValue}
          onClose={e => this.handleEditVisible()}
          onSubmit={this.handleEditSubmit}
        />}
      </>
    )
  }
}