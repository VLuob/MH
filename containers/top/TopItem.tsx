import { Component } from 'react'
import { toJS } from 'mobx'
import { Skeleton, Dropdown, Menu, Icon } from 'antd'

const imgOne = '/static/images/top/top_one.svg'
const imgTwo = '/static/images/top/top_two.svg'
const imgThree = '/static/images/top/top_three.svg'

const rankingImgMap = {
  1: imgOne,
  2: imgTwo,
  3: imgThree,
}

export default class TopItem extends Component {

  renderRanking(ranking) {
    return ranking <= 3 ? <span className="img"><img src={rankingImgMap[ranking]}/></span> : <span className="text"><span className="no">NO.</span>{ranking}</span>
  }

  render() {
    const { currRanking, ranking, latestRanking, rankingShow, children, loading, isTotalRank } = this.props
    // const latestRankingLabel = latestRanking || '未上榜'

    const menu = (
      <ul className="top-info-dropdown-menu">
          <li>
            <div className="count">{ranking}</div>
            <div className="label">本期排名</div>
          </li>
          {!!latestRanking &&
          <li>
            <div className="count">{latestRanking}</div>
            <div className="label">上期排名</div>
          </li>}
          <li>
            <div className="count">{rankingShow}</div>
            <div className="label">上榜周期</div>
          </li>
        </ul> 
    );

    return (
      <li className="top-item">
        <Skeleton loading={loading} active avatar>
        <div className="top-info-box">
          <div className="top-info-ranking">
            {/* {this.renderRanking(currRanking)} */}
            <span className={`num${currRanking <= 3 ? ' top' : ''}`}>{currRanking}</span>
          </div>
          <div className="top-info-bottom">
            {isTotalRank && <span>排名</span>}
            {!isTotalRank && <Dropdown 
              overlay={menu} 
              trigger={['hover']}
              placement="bottomCenter"
            >
              <a className="ant-dropdown-link">
                本期排名 <Icon type="caret-down" />
              </a>
            </Dropdown>}
          </div>
          {/* <ul className="top-info-bottom">
            <li>
              <div className="count">{ranking}</div>
              <div className="label">本期排名</div>
            </li>
            {!!latestRanking &&
            <li>
              <div className="count">{latestRanking}</div>
              <div className="label">上期排名</div>
            </li>}
            <li>
              <div className="count">{rankingShow}</div>
              <div className="label">上榜周期</div>
            </li>
          </ul> */}
        </div>
        <div className="top-content-box">
          {children}
        </div>
      </Skeleton>
      </li>
    )
  }
}