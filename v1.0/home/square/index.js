// home/square/index.js
let app = getApp();
let common = app.common;
let Apis = app.Apis;
Page({
  data: {
    postList: []
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    let self = this;
    tryToGetData(this)
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    tryToGetData(this)
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onPullDownRefresh: function () {
    tryToGetData(this)
  },
  onAddClick: function () {
    common.to('/pages/publish/index')
  },
  onImageClick: function (e) {
    let idx = e.target.dataset.idx;
    let images = this.data.postList[idx].images;
    let path = e.target.dataset.path;
    wx.previewImage({
      current: path,
      urls: images
    })
  },
  onAvatarClick: function (e) {
    common.to('/pages/profile/index?userid=' + e.target.dataset.userid)
  },
  onItemMenuClick: function (e) {
    let self = this;
    let idx = e.target.dataset.idx;
    let post = this.data.postList[idx];
    let actions = [];
    if (post.isLike) {
      actions.push('取消点赞')
    } else {
      actions.push('点赞')
    }
    if (post.isFav) {
      actions.push('取消收藏')
    } else {
      actions.push('收藏')
    }
    if (post.userid != self.data.userid) {
      if (post.isFollow) {
        actions.push('取消关注')
      } else {
        actions.push('关注')
      }
    }
    wx.showActionSheet({
      itemList: actions,
      success: function (res) {
        let index = res.tapIndex;
        if (index != null) {
          switch (index) {
            case 0:
              like(self, post, idx)
              break;
            case 1:
              favorites(self, post, idx)
              break;
            case 2:
              follow(self, post)
              break;
          }
        }
      }
    })
  }
})
function like(self, post, index) {
  let postid = post.postid;
  let api = post.isLike ? Apis.unLike(postid) : Apis.like(postid);
  common.request(
    api,
    (res) => {
      if (Apis.checkResult(res)) {
        common.showToast((post.isLike ? '取消' : '') + '点赞成功');
        let postList = self.data.postList;
        postList[index].isLike = !post.isLike;
        self.setData({
          postList: postList
        })
      }
    },
    (err) => {
      operationError()
    }
  )
}
function favorites(self, post, index) {
  let postid = post.postid;
  let api = post.isFav ? Apis.unFavorites(postid) : Apis.favorites(postid);
  common.request(
    api,
    (res) => {
      if (Apis.checkResult(res)) {
        common.showToast((post.isLike ? '取消' : '') + '收藏成功');
        let postList = self.data.postList;
        postList[index].isFav = !post.isFav;
        self.setData({
          postList: postList
        })
      }
    },
    (err) => {
      operationError()
    }
  )
}
function follow(self, post) {
  let userid = post.userid;
  let isFollow = post.isFollow;
  let api = post.isFollow ? Apis.unFollow(userid) : Apis.follow(userid);
  common.request(
    api,
    (res) => {
      if (Apis.checkResult(res)) {
        common.showToast((post.isFollow ? '取消' : '') + '关注成功');
        let postList = self.data.postList;
        postList.forEach((item) => {
          if (item.userid == userid) {
            item.isFollow = !isFollow
          }
        })
        self.setData({
          postList: postList
        })
      }
    },
    (err) => {
      operationError()
    }
  )
}
function operationError() {
  common.showToast('操作失败')
}
function tryToGetData(self) {
  app.getUserid((userid) => {
    self.setData({
      userid: userid,
      imgSize: (app.getWidth() - 120) / 2
    })
    getData(self)
  })
}
function getData(self) {
  common.request(
    Apis.postList(self.data.userid, 1, 999999),
    (res) => {
      wx.stopPullDownRefresh()
      if (Apis.checkResult(res)) {
        let postList = res.data.result || [];
        postList.forEach((item) => {
          item.time = new Date(item.update).format('yyyy-MM-dd HH:mm:ss')
        })
        self.setData({
          postList: postList
        })
      }
    },
    (err) => {
      console.log(err)
      wx.stopPullDownRefresh()
    }
  )
}