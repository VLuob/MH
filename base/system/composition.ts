
const composition = {
  getInnerShotsString(shots) {
    const hideNavBtn = shots.length <= 2
    const isSingle = shots.length === 1

    const slides = [];
    shots.forEach(item => {
      slides.push(`
      <div class="swiper-slide">
        <div class="inner-shots-item">
          <a class="inner-shots-cover" href="/shots/${item.compositionId}" target="_blank"><img src="${item.cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360" /></a>
          <div class="inner-shots-content">
            <a class="inner-shots-title" href="/shots/${item.compositionId}" target="_blank">${item.title}</a>
          </div>
        </div>
      </div>
      `);
    });

    const html = `
      <div class="inner-shots-container">
        <div class="inner-shots-header">相关作品</div>
        <div class="inner-shots-content ${isSingle ? 'single' : ''}">
          <div class="swiper-container">
            <div class="swiper-wrapper">${slides.join('')}</div>
            <div class="swiper-button-next ${hideNavBtn ? 'nav-btn-hide' : ''}"></div>
            <div class="swiper-button-prev ${hideNavBtn ? 'nav-btn-hide' : ''}"></div>
          </div>
        </div>
      </div>
    `;
    return html;
  },

  /**
   * 将广告转变成作品
   * @param adsData 
   */
  adsConvertShots(adsData) {
    const adArr = []
    for (let i = 1; i <= 3; i++) {
      // for (let k in adsData) {
        // 首页作品位置、作品列表作品位置、登录注册左侧作品位置
        const ads = adsData[`f_h_l_w_${i}`] || adsData[`f_w_s_${i}`] || adsData[`f_l_l_${i}`]
        // const ads = adsData[k]
        if (ads && ads[0]) {
            const ad = ads[0]
            const defaultAppSetting = '{"appSetting":{"appOpenScreenImages":null},"showSetting":{"title":true,"recommendation":false}}'
            const adSetting = JSON.parse(ad.setting || defaultAppSetting)
            const adShowSetting = adSetting.showSetting || {}
            if (ad.type === 1) {
                // 站内广告
                const composition = ad.compositionList && ad.compositionList[0]
                if (composition) {
                    adArr.push({
                      ...composition,
                      compositionId: composition.id,
                      adId: ad.id,
                      adPlace: i,
                      adShowRecommend: adShowSetting.recommendation,
                    })
                }
            } else {
                // 站外广告
                adArr.push({
                    id: (+new Date() + parseInt(Math.random() * 9000 + 1000)),
                    isJumpAd: true,
                    adId: ad.id,
                    adPlace: i,
                    adShowTitle: adShowSetting.title,
                    adShowRecommend: adShowSetting.recommendation,
                    title: ad.title,
                    cover: ad.image,
                    link: ad.link,
                    authorId: ad.advertiserId,
                    authorName: ad.advertiserName,
                    authorAvatar: ad.advertiserAvatar,
                    authorCode: ad.advertiserCode,
                })
            }
        }
    }
    return adArr
  },

  /**
   * 将广告随机合并到作品中
   * @param shotsList 作品列表 
   * @param adsData  相关广告
   * @param isMobile 是否是移动端
   */
  mergeShotsAndAds({shotsList, adsData, placeMap, isMobile}: any){
    const ads = Array.isArray(adsData) ? adsData : this.adsConvertShots(adsData)

    const shots = shotsList || []
    ads.forEach((ad, index) => {
        // const min = spaceLength * index + (index > 0 ? 3 : 0)
        // const max = spaceLength * index + spaceLength - 1
        // const randomIndex = isMobile ? ((index + 1) * 3 - 1) : parseInt(Math.random() * (max - min + 1) + min, 10)
        // 插入位置，默认固定3、6、9位置
        const randomIndex = placeMap ? placeMap[ad.adPlace] : (ad.adPlace * 3) - 1
        // console.log('random index',min, max, randomIndex)
        shots.splice(randomIndex, 0, ad)
    })
    return shots
  },
  
}

export { composition }