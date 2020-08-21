import { PureComponent } from 'react'
import { Table } from 'antd'
import { CompositionTypes } from '@base/enums'


export default class DetailList extends PureComponent {
  
  columns = [
    {
      title: '作品/文章',
      dataIndex: 'compositionTitle',
      render: (text, record) => {
        const typeUrl = `/${record.compositionType === CompositionTypes.ARTICLE ? 'article' : 'shots'}`
        const linkUrl = `${typeUrl}/${record.compositionId}`
        return(
        <div className="composition-intro">
          <div className="cover">
            <a href={linkUrl} target="_blank">
              <img src={record.compositionCover + '?imageMogr2/thumbnail/!504x360r/gravity/center/crop/504x360'} alt=""/>
            </a>
          </div>
          <div className="content">
            <div className="title">
            <a href={linkUrl} target="_blank">
              {record.compositionTitle}
            </a>
            </div>
            <div className="summary">
              {record.compositionSummary}
            </div>
            <div className="actions">
              <a href={typeUrl} target="_blank">
              {record.compositionType === CompositionTypes.ARTICLE ? '文章' : '作品'}
              </a>
            </div>
          </div>
        </div>
      )}
    },
    {
      title: '浏览量',
      dataIndex: 'compositionViews',
      render: (text) => <div className="text-wrapper">{text}</div>,
    },
    {
      title: '喜欢量',
      dataIndex: 'compositionFavors',
      render: (text) => <div className="text-wrapper">{text}</div>,
    },
    {
      title: '收藏量',
      dataIndex: 'compositionCollections',
      render: (text) => <div className="text-wrapper">{text}</div>,
    },
    {
      title: '评论量',
      dataIndex: 'compositionComments',
      render: (text) => <div className="text-wrapper">{text}</div>,
    },
    
  ]

  render() {
    const { data, onPagination } = this.props
    const list = data.list || []
    const page = data.page
    const size = data.size
    const total = data.total

    return (
      <div className="stat-detail-box">
        <Table 
          rowKey={'compositionId'}
          columns={this.columns}
          dataSource={list}
          pagination={{
            hideOnSinglePage: true,
            current: page,
            pageSize: size,
            total,
            onChange: onPagination,
          }}
        />
      </div>
    )
  }
}