import Head from 'next/head'

/**
 * 标题 - title 
 * 关键字 - keywords
 * 描述 - description
 */
const HeadComponent = ({ title, keywords, description }) => {
  return (
    <Head>
      <title>{title || "梅花网-营销作品宝库"}</title>
      <meta name="keywords" content={keywords || "营销作品、营销案例网、广告创意、广告设计、市场营销、产品推广、创意市场、营销推广"} />
      <meta name="description" content={description || "梅花网聚焦行业营销案例，致力于成为国内收录数量最大、信息价值点最丰富的营销作品宝库，作品涵盖平面海报、视频制作、创意设计、公关活动等，为行业上下游打造一个合作共赢的互动交流和在线对接平台。"} />
      <meta property="wb:webmaster" content="69fc0203d751425a" />
      <meta property="qc:admins" content="1401213033655105161667" />
      <meta name="HandheldFriendly" content="true" />
      <meta content="telephone=no,email=no" name="format-detection" />
      <meta name="ujianVerification" content="7e573e83e49f1d4c5fe64395904f8dd0" />
      <meta httpEquiv="X-UA-Compatible" content="text/html; charset=utf-8; IE=9;chrome=1" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="//at.alicdn.com/t/font_1233346_vjdr8qnme6g.css" />
    </Head>
  )
}

export default HeadComponent