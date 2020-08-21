const tabList = [{
    key: `0`,
    name: `全部`
}, {
    key: `1`,
    name: `个人`
}, {
    key: `2`,
    name: `品牌主`
}, {
    key: `3`,
    name: `服务商`
}]

const subTabList = [/* {
    key: `1`,
    name: `推荐`,
} */, {
    key: `degree`,
    name: `热门`,
    // menu: [{
    //     key: 'degree',
    //     name: `热门`
    // }, {
    //     key: 'favors',
    //     name: `喜欢`
    // }, {
    //     key: 'views',
    //     name: `浏览`
    // }, {
    //     key: 'worksQuantity',
    //     name: `作品`
    // }, {
    //     key: 'fans',
    //     name: `粉丝`
    // }]
}, {
    key: `gmtCreate`,
    name: `最新`,
}, {
    key: `follower`,
    name: `关注`,
}, {
    icon: `caret-down`,
    key: `area`,
    name: `全部地区`,
    // menu: [],
    // styles: {float: `right`, textAlign: `right`},
    style: { float: `right`, textAlign: `right` }
}]

export { tabList, subTabList }