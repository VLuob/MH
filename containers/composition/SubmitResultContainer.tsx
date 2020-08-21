import { PureComponent } from 'react'
import { observer, inject } from 'mobx-react'
import { Icon, Button, Input, message } from 'antd'
import { CompositionTypes } from '@base/enums'

const typeNameMap = {
  [CompositionTypes.ARTICLE]: 'article',
  [CompositionTypes.SHOTS]: 'shots',
}

const typeLabelMap = {
  [CompositionTypes.ARTICLE]: '文章',
  [CompositionTypes.SHOTS]: '作品',
}

export interface Props {
  query: object
}

@inject(stores => {
  const { compositionStore } = stores.store
  return {
    compositionStore,
  }
})
@observer
export default class SubmitResultContainer extends PureComponent<Props> {

  handlePreview = () => {
    const { query, compositionStore } = this.props
    const compositionId = query.id
    const typeName = typeNameMap[query.type]

    compositionStore.fetchCompositionPreviewCode({compositionId}, (res) => {
      if (res.success) {
        window.open(`/${typeName}/preview/${res.data}`)
      }
    })
  }
  render() {
    const { query} = this.props
    const compositionId = query.id
    const orgId = query.orgId
    const typeName = typeNameMap[query.type]
    const typeLabel = typeLabelMap[query.type] || '文章'

    const creationUrl = `/teams/${orgId}/creation?type=${typeName}&status=1`

    return (
      <div className="display-container">
          <div className="display-content">
            <div className="display-info">
              <div className="display-info-icon">
                <Icon type="check-circle" theme="filled" />
              </div>
              <div className="display-info-text">
                <div className="title">
                  提交成功
                </div>
                <div className="desc">
                  我们将会尽快审核您的{typeLabel}，梅花网有权拒绝收录不符合条件的{typeLabel}
                </div>
              </div>
            </div>
            <div className="footer">
              <Button onClick={this.handlePreview}>预览{typeLabel}</Button>
              <Button type="primary" className="themes" href={creationUrl} target="_blank">确认</Button>
            </div>
          </div>
      </div>
    )
  }
}