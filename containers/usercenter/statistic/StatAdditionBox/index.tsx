import { StatisticsType } from '@base/enums'

const StatAdditionBox = (props) => {
  const { statAdditions, statisticType } = props

  return (
    <div className="stat-additions-box">
      {StatisticsType.SHOTS === statisticType &&
        <>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.exposureCount || 0}</div>
            <div className="name">作品曝光量</div>
          </div>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.worksCount || 0}</div>
            <div className="name">作品浏览量</div>
          </div>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.favorCount || 0}</div>
            <div className="name">作品喜欢数</div>
          </div>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.collectionCount || 0}</div>
            <div className="name">作品收藏量</div>
          </div>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.commentCount || 0}</div>
            <div className="name">作品评论量</div>
          </div>
        </>}
      {StatisticsType.ARTICLE === statisticType &&
        <>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.worksCount || 0}</div>
            <div className="name">文章浏览量</div>
          </div>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.favorCount || 0}</div>
            <div className="name">文章喜欢数</div>
          </div>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.collectionCount || 0}</div>
            <div className="name">文章收藏量</div>
          </div>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.commentCount || 0}</div>
            <div className="name">文章评论量</div>
          </div>
        </>}
      {StatisticsType.AUTHOR === statisticType &&
        <>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.authorViewsCount || 0}</div>
            <div className="name">主页浏览量</div>
          </div>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.weekRank || 0}</div>
            <div className="name">周榜排行</div>
          </div>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.totalRank || 0}</div>
            <div className="name">总榜排行</div>
          </div>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.degreeRank || 0}</div>
            <div className="name">热门排行</div>
          </div>
          <div className="stat-additions-item">
            <div className="number">{statAdditions.authorFansCount || 0}</div>
            <div className="name">粉丝量</div>
          </div>
        </>}
    </div>
  )
}

export default StatAdditionBox