import { Component} from 'react'
import classnames from 'classnames'
import { Progress, Avatar } from 'antd'

import CustomIcon from '@components/widget/common/Icon'

import { config, session } from '@utils'

const maxDowncount = 5

class VideoEnding extends Component {
  constructor(props) {
    super(props)
    this.state = {
      downcountVisible: props.autoPlay,
      downcount: maxDowncount,
    }
  }

  downcountTimer = null

  componentDidMount() {
    this.handleDowncount()
  }

  componentWillMount() {
    this.clearTimer()
  }

  handleDowncount = () => {
    this.clearTimer()
    this.downcountTimer = setInterval(() => {
      const { downcount, downcountVisible } = this.state
      if (downcount <= 0) {
        clearInterval(this.downcountTimer)
        if (downcountVisible) {
          this.handlePlay()
        }
      } else {
        this.setState({downcount: downcount - 1})
      }

    }, 1000)
  }

  clearTimer() {
    if (this.downcountTimer) clearInterval(this.downcountTimer)
  }

  hideDowncount() {
    this.setState({downcountVisible: false})
  }

  handleCancel = () => {
    this.clearTimer()
    this.hideDowncount()
  }

  handlePlay = () => {
    const { onPlay, shots=[] } = this.props
    const { downcountVisible } = this.state
    if (!downcountVisible) {
      return
    }
    if (onPlay) onPlay()
    const shotsItem = shots[0]
    if (shotsItem) {
      session.set(config.SESSION_DETAIL_AUTO_PLAY, 1)
      location.href = `/shots/${shotsItem.compositionId}`
    }
  }

  render() {
    const { autoPlay, shots=[], playersState, currentIndex, visible} = this.props
    const { downcountVisible, downcount } = this.state
    
    const isSingle = autoPlay && downcountVisible
    const nextShots = isSingle ? shots.slice(0,1) : shots.slice(0,2)
    const percent = (maxDowncount - downcount) * 100 / maxDowncount

    return (
      <div className="player-ending">
        <div className="player-ending-wrapper">
          <div className="ending-next-video-explain">
          {isSingle ? `${downcount}秒后播放` : '推荐作品'}
          </div>
          <div className={classnames('ending-next-video', {single: isSingle})}>
            {nextShots.map(item => {

              return (
                <div className="ending-next-video-item" key={item.compositionId}>
                  <div className="cover">
                    <a href={`/shots/${item.compositionId}`} title={item.title}>
                      <img src={item.cover + '?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360'} alt={item.title} title={item.title} />
                    </a>
                    {downcountVisible && autoPlay && <div className="player-downcount-wrapper">
                      <div className="downcount-progress">
                        <Progress 
                          type="circle" 
                          percent={percent}
                          width={50}
                          showInfo={false}
                          strokeColor="#ffffff"
                        />
                        <div className="player-btn" onClick={this.handlePlay}><CustomIcon name="play" /></div>
                      </div>
                      <div className="btn-cancel"><span className="cancel-text" onClick={this.handleCancel}>取消</span></div>
                    </div>}
                  </div>
                  <div className="title">
                    <a href={`/shots/${item.compositionId}`} title={item.title}>{item.title}</a>
                  </div>
                  <div className="intro">
                    <a href={`/author/${item.authorCode}`} target="_blank" title={item.authorName}><Avatar src={item.authorAvatar} size={16} /><span className="nickname">{item.authorName}</span></a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
}
} 

export default VideoEnding