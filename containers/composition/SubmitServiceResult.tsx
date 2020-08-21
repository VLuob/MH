import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Icon, Button, message } from 'antd'

export interface Props {
  query: object
}

@inject(stores => {
  const { serviceStore } = stores.store
  return {
    serviceStore,
  }
})
@observer
export default class SubmitServiceResult extends Component<Props> {
  state = {
    loading: false,
  }

  handlePreview = () => {
    const { query, serviceStore } = this.props
    const serviceId = query.id
    this.setState({laoding: true})
    serviceStore.fetchServicePreviewCode({serviceId}).then((res) => {
      this.setState({laoding: false})
      if (res.success) {
        // window.open(`/service/preview/${res.data}`)
        location.href = `/service/preview/${res.data}`
      }
    }).catch(err => {
      this.setState({laoding: false})
    })
  }
  render() {
    const { loading } = this.state
    const { query} = this.props
    const serviceId = query.id
    const authorId = query.authorId

    const creationUrl = `/teams/${authorId}/service?status=2`

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
                  我们将会尽快审核您的服务，梅花网有权拒绝收录不符合条件的服务
                </div>
              </div>
            </div>
            <div className="footer">
              <Button onClick={this.handlePreview} loading={loading}>预览服务</Button>
              <Button type="primary" href={creationUrl} target="_blank">管理服务</Button>
            </div>
          </div>
      </div>
    )
  }
}