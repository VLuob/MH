import { PureComponent } from 'react'
import { Icon } from 'antd'



export interface Props {
  query: object
}

export default class ResultContainer extends PureComponent<Props> {
  render() {

    return (
      <div className="display-container">
          <div className="display-content">
            <div className="display-info">
              <div className="display-info-icon">
                <Icon type="check-circle" theme="filled" />
              </div>
              <div className="display-info-text">
                <div className="title">
                  退订成功, 欢迎再次订阅！
                </div>
                <div className="desc" style={{marginTop: '30px'}}>
                  <a href="/">返回首页</a>
                </div>
              </div>
            </div>
          </div>
      </div>
    )
  }
}