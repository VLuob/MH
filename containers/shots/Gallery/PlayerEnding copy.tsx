import { useState, useEffect, useCallback } from 'react'
import classnames from 'classnames'
import { Progress } from 'antd'

import CustomIcon from '@components/widget/common/Icon'

const VideoEnding = (props) => {
      const { autoPlay, shots=[], playersState, currentIndex, visible} = props
      const [downcountVisible, setDowncountVisible] = useState(autoPlay)
      const [downcount, setDowncount] = useState(5)
      
      const isSingle = autoPlay && downcountVisible
      const nextShots = isSingle ? shots.slice(0,1) : shots.slice(0,2)
      let downcountTimer = null

      useEffect(() => {

        if (autoPlay) {
          handleDowncount()
        }
      }, [autoPlay])

      const handleDowncount = useCallback(() => {
        if (downcountTimer) clearInterval(downcountTimer)
        downcountTimer = setInterval(() => {
          if (downcount <= 0) {
            clearInterval(downcountTimer)
          }
          
          setDowncount(downcount - 1)
          console.log('down', downcount)
        }, 1000)
      }, [])

      return (
        <div className="player-ending">
          <div className="player-ending-wrapper">
            <div className="ending-next-video-explain">
            {downcount}秒后播放
            </div>
            <div className={classnames('ending-next-video', {single: isSingle})}>
              {nextShots.map(item => {
  
                return (
                  <div className="ending-next-video-item" key={item.compositionId}>
                    <div className="cover">
                      <a href={`/shots/${item.compositionId}`}>
                        <img src={item.cover + '?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360'} alt={item.title} />
                      </a>
                      <div className="player-downcount-wrapper">
                        <div className="downcount-progress">
                          <Progress 
                            type="circle" 
                            percent={55}
                            width={50}
                            showInfo={false}
                            strokeColor="#ffffff"
                          />
                          <div className="player-btn"><CustomIcon name="play" /></div>
                        </div>
                        <div className="btn-cancel"><span className="cancel-text">取消</span></div>
                      </div>
                    </div>
                    <div className="title">
                      <a href={`/shots/${item.compositionId}`}>{item.title}</a>
                    </div>
                    <div className="intro">
                      <a href={`/brand/${item.brandId}`} target="_blank">{item.brandName}</a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
}

export default VideoEnding