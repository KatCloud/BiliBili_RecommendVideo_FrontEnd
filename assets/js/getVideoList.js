let token = localStorage.getItem('access_token')

let Component = Vue.extend({
	template: '<p></p>'
})
Vue.component('go-top', Component)
new Vue({
	el: '#videoList',
	data: {
		// 工具版本号
		biliToolVersion: '3.4', // 2022.5.13 update
		toolId: 1,
		// ---------
		// 骨架屏
		isSkeleton: false,
		skelist: [1, 2, 3, 4, 5, 6],
		// ---------
		videolist: [],
		isLogin: false,
		isLoading: false,
		// 推荐列表索引
		idx: '',
		// 临时list
		item: [],
		loading: false,
		notifyPromise: Promise.resolve(),
		fullScreenLoading: false,
		loadMoreFlag: false,
		// 已关注直播列表
		liveList: [],
		isLoadLive: false,
		// 检查动态新发视频
		dynamicCount: '0',
		isDynamicHide: true,
		// 搜索
		// keyWord: '',
		// 不喜欢视频的index
		dislikeIndex: -1
	},
	methods: {
		// 搜索
		// search(){
		// 	window.open('https://search.bilibili.com/all?keyword=' + this.keyWord, '_blank')
		// },

		// 显示判断
		checkGoto(str) {
			let isHaveUp = ['av', 'vertical_av', 'live', 'article', 'picture']
			if (isHaveUp.includes(str)) {
				return true
			} else {
				return false
			}
		},

		// 限制标题的长度，以免溢出卡片
		titleLimited(title, maxLength) {
			if (title.length > maxLength) {
				return true
			} else {
				return false
			}
		},

		// idx索引判断大小，从而判断返回数组为正序还是倒序
		isHeadBiggerThanFoot(headIdx, footIdx) {
			if (headIdx > footIdx) {
				return true
			} else {
				return false
			}
		},

		// 显示通知
		showNotify(type, title, msg, duration = 4500, showClose = true) {
			this.notifyPromise = this.notifyPromise.then(this.$nextTick).then(() => {
				this.$notify({
					title: title,
					message: msg,
					offset: 100,
					type: type,
					duration: duration,
					showClose: showClose
				});
			})
		},

		// 信息提示
		showMessage(type, msg, duration = 4000) {
			this.$message({
				type: type,
				message: msg,
				duration: duration
			})
		},

		// 判断special_s的封面
		checkSpecialCover(url) {
			if (url.includes("@")) {
				return true
			} else {
				return false
			}
		},

		// 下拉列表	START -----------------------------------------------------------------------------------------------------------		
		// 下拉列表前处理（视频卡片独有）
		beforeHandleCommand(command, content, obj = null, index = null) {
			return {
				'command': command,
				'content': content,
				'obj': obj,
				'index': index
			}
		},

		// 下拉列表操作（视频卡片独有）
		handleCommand(command) {
			switch (command.command) {
				// 稍后再看
				case 'a':
					this.addWatchLater(command.content)
					break;
				// 获取封面	
				case 'b':
					this.navToCoverTool(command.content)
					break;
				// 分享视频链接
				case 'c':
					// console.log(command)
					const title = command.content
					const upname = command.obj
					const avid = command.index
					this.shareVideo(title, upname, avid)
					break;
				// 不喜欢某视频
				case 'd':
					// console.log(command.index)
					const index = command.index
					const obj = command.obj
					const reason_id = command.content
					const aid = obj.args.aid
					const rid = obj.args.rid
					const goto = obj.goto
					const mid = obj.args.up_id
					const tid = obj.args.tid
					this.dislikeVideo(index, aid, rid, goto, mid, tid, reason_id)
					break;
			}

		},

		// 稍后再看
		addWatchLater(aid) {
			// 全屏加载
			const loading = this.$loading({
				lock: true,
				text: '正在添加到稍后再看...',
				background: 'rgba(0, 0, 0, 0.7)'
			})
			$.ajax({
				url: baseUrl + '/addWatchLater',
				timeout: 30000,
				type: 'POST',
				data: {
					loginToken: token,
					aid: aid
				},
				success: (res) => {
					loading.close()
					// console.log(res)
					if (res.code == 200) {
						this.showNotify('success', '搞定啦', '已添加到稍后再看', 2000)
					} else {
						this.showNotify('error', '出现问题', '（错误代码: ' + res.code + '）')
					}
				},
				complete: (res, status) => {
					if (status == 'timeout') {
						this.showNotify('error', '错误', '加载超时，请刷新页面', 0)
						loading.close()
					} else if (status == 'error') {
						this.showNotify('error', '错误', '（错误代码: ' + res.code + '）', 0)
						loading.close()
					}
				}
			})
		},

		// 获取封面
		navToCoverTool(cover) {
			window.open(cover, '_blank')
		},

		// 分享视频链接
		shareVideo(title, upname, avid) {
			const link = title + '--up：'
				+ upname + '--link：'
				+ 'https://www.bilibili.com/video/av' + avid
			
			navigator.clipboard.writeText(link).then(() => {
				/* clipboard successfully set */
				this.showMessage('success', '分享链接已复制到剪贴板！')
			}, () => {
				/* clipboard write failed */
				this.showMessage('error', '复制分享链接时出现问题，可能是浏览器不支持')
			});
		},

		// 不喜欢某视频
		dislikeVideo(index, aid, rid, goto, mid, tid, reason_id) {
			this.dislikeIndex = index
			$.ajax({
				url: baseUrl + '/dislikeVideo',
				type: 'GET',
				data: {
					loginToken: token,
					aid: aid,
					rid: rid,
					_goto: goto,
					mid: mid,
					tag_id: tid,
					reasonId: reason_id
				},
				success: (res) => {
					if (res.code == 200) {
						this.videolist.splice(index, 1)
						this.showNotify('success', '已反馈', '将减少此类内容推荐', 2000)
						this.dislikeIndex = -1
					} else {
						this.showNotify('error', '错误', '反馈失败！（错误代码: ' + res.code + '）', 0)
						this.dislikeIndex = -1
					}
				}
			})
		},

		// 下拉列表	END -----------------------------------------------------------------------------------------------------------		
		// 获取用户关注的直播列表
		getLiveList() {
			$.ajax({
				url: baseUrl + '/getLiveList',
				type: 'GET',
				data: {
					loginToken: token
				},
				success: (res) => {
					if (res.code == 200) {
						this.isLoadLive = false
						this.liveList = res.data.data.rooms
					}
				}
			})
		},

		// 拿视频列表（首次）
		getVideoList() {
			// 全屏加载
			// const loading = this.$loading({
			// 	lock: true,
			// 	text: 'Loading',
			// 	background: 'rgba(0, 0, 0, 0.7)'
			// })
			const checkLogin = this.$message({
				type: 'info',
				message: '正在进行登录态检查...',
				duration: 0
			})
			this.isSkeleton = true
			// this.isLoading = true
			$.ajax({
				url: baseUrl + '/getVideoList',
				timeout: 30000,
				type: 'GET',
				data: {
					loginToken: token,
					idx: this.idx
				},
				success: (res) => {
					// console.log(res)
					// this.isLoading = false
					// loading.close()
					if (res.code == 200) {
						// 列表
						const videoList = res.data.data.items
						// console.log(videoList)
						// 获取头尾idx
						const headIdx = res.data.data.items.slice(0, 1)[0].idx
						const footIdx = res.data.data.items.slice(-1)[0].idx
						// 判断获取的数组是正序还是倒序
						if (this.isHeadBiggerThanFoot(headIdx, footIdx)) {
							// 倒序
							this.idx = footIdx
							// 转成正序
							this.videolist = videoList.reverse()
						} else {
							// 正序
							this.idx = headIdx
							this.videolist = videoList
						}
						// 登录鉴定
						if (res.data.isLogin) {
							this.isLogin = true
							this.isLoadLive = true
							this.showNotify('info', '提示', '已登录', 1500)
							this.getLiveList()
						} else {
							this.showNotify('warning', '提示', '由于你尚未登录，为你获取全站推荐视频，或点击登录按钮登录')
						}
					} else {
						this.showNotify('error',
							'错误',
							'获取推荐视频列表时出现问题（错误代码: ' + res.code + '）', 0)
					}
					// loading.close()
					checkLogin.close()
					this.isSkeleton = false
				},
				complete: (res, status) => {
					if (status == 'timeout') {
						this.showNotify('error', '错误', '加载超时，请刷新页面', 0)
						// loading.close()
						checkLogin.close()
						this.isSkeleton = false
					} else if (status == 'error') {
						this.showNotify('error', '错误', '网络连接中断，请检查网络状况', 0)
						// loading.close()
						checkLogin.close()
						this.isSkeleton = false
					}
				}
			})
			// this.showNotify('info', '提示', '点击版本号查看更新日志~')
		},

		// 拿更多视频，接在原list上
		moreVideoList() {
			// console.log('more')
			// 全屏加载
			const loading = this.$loading({
				lock: true,
				text: '正在获取更多推荐...',
				background: 'rgba(0, 0, 0, 0.7)'
			})
			// this.isLoading = true
			$.ajax({
				url: baseUrl + '/getVideoList',
				timeout: 30000,
				type: 'GET',
				data: {
					loginToken: token,
					idx: this.idx
				},
				success: (res) => {
					// console.log(res)
					// this.isLoading = false
					// loading.close()
					if (res.code == 200) {
						// 列表
						const moreVideoList = res.data.data.items
						// console.log(moreVideoList)
						// 获取头尾idx
						const headIdx = res.data.data.items.slice(0, 1)[0].idx
						const footIdx = res.data.data.items.slice(-1)[0].idx
						// 判断获取的数组是正序还是倒序
						if (this.isHeadBiggerThanFoot(headIdx, footIdx)) {
							// 倒序
							this.idx = footIdx
							// 原列表正序
							const videoList = this.videolist
							// 将获得的列表正序并接在原列表后
							const newList = videoList.concat(moreVideoList.reverse())
							// 赋值
							this.videolist = newList
						} else {
							// 正序
							this.idx = headIdx
							// 将原列表正序
							const videoList = this.videolist
							// 将获得的列表接在原列表后
							const newList = videoList.concat(moreVideoList)
							// 赋值
							this.videolist = newList
						}
						this.showNotify('success', '好耶', '获得' + moreVideoList.length + '条新内容', 1000)
						// 登录鉴定
						if (res.data.isLogin) {
							this.isLogin = true
						} else {
							this.showNotify('warning', '提示', '由于你尚未登录，为你获取全站推荐视频，或点击登录按钮登录')
						}
						loading.close()
					} else {
						this.showNotify('error',
							'错误',
							'获取推荐视频列表时出现问题（错误代码: ' + res.code + '）')
					}
				},
				complete: (res, status) => {
					if (status == 'timeout') {
						this.showNotify('error', '错误', '加载超时，请刷新页面', 0)
						loading.close()
					} else if (status == 'error') {
						this.showNotify('error', '错误', '获取推荐视频列表时出现问题（错误代码: ' + res.code + '）', 0)
						loading.close()
					}
				}
			})
		},

		// 退出登录前确认
		logOutConfirm() {
			this.$confirm('是否退出登录?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
				closeOnHashChange: false
			}).then(() => {
				this.logOut()
			}).catch(() => {
			});
		},

		// 退出登录（暂时写在这里吧）
		logOut() {
			$.ajax({
				url: baseUrl + '/logout',
				timeout: 30000,
				type: 'GET',
				data: {
					loginToken: token
				},
				success: (res) => {
					if (res.code == 200) {
						this.isLogin = false
						localStorage.removeItem('access_token')
						this.showNotify('success', '提示', '你已退出登录')
					} else {
						this.showNotify('error', '错误', '退出登录时出现问题, 请稍后再试')
					}
				},
				complete: (res, status) => {
					if (status == 'timeout') {
						this.showNotify('error', '错误', '加载超时，请刷新页面', 0)
						loading.close()
					} else if (status == 'error') {
						this.showNotify('error', '错误', '网络连接中断，请检查网络状况', 0)
						loading.close()
					}
				}
			})
		},

		// 计时器
		timer() {
			window.setInterval(() => {
				setTimeout(() => {
					this.getDynamicCount()
				}, 0)
			}, 60000)
		},

		// 拿动态角标
		getDynamicCount() {
			$.ajax({
				url: baseUrl + '/getDynamicCount',
				type: 'GET',
				data: {
					loginToken: token
				},
				success: (res) => {
					// console.log(res)
					if (res.code == 200) {
						let alltype = res.data.data.alltype_num
						let article = res.data.data.article_num
						let video = res.data.data.video_num
						let total = alltype + article + video
						// console.log(total)
						if (total == 0) {
							// console.log('re run...')
						} else {
							this.dynamicCount = total
							this.isDynamicHide = false
						}
					}
				}
			})
		},

		// 点击动态按钮时，计数清零
		clickDynamicBtn() {
			this.dynamicCount = '0'
			this.isDynamicHide = true
		},

		// 获取工具最新版本
		updateNewestVersion() {
			$.ajax({
				url: baseUrl + '/vc/getToolVersion',
				type: 'GET',
				data: {
					toolId: this.toolId
				},
				success: (res) => {
					// console.log(res)
					if (res.code == 200) {
						let newestVersion = res.data.toolVersion
						if (this.biliToolVersion === newestVersion) {
							// console.log('nothing to update')
						} else {
							// console.log('update available')
							this.showNotify('warning', '工具已有更新!', '按下Ctrl + F5即可更新！', 0, false)
						}
					} else {
						this.showNotify('error', '获取更新失败！(' + res.code + ')')
					}
				}
			})
		}
	},
	created() {
		this.updateNewestVersion()
		this.getVideoList()
		// this.getLiveList()
		this.getDynamicCount()
		this.timer()
		// this.isSkeleton = true
		console.log(
			'\n' + ' %c Bili Recommend Tool ' + ' %c v' + this.biliToolVersion + ' '
			+ '\n', 'color: #fadfa3; background: #030307; padding:5px 0;',
			'color: #242424; background: #fadfa3; padding:5px 0;');
	},
	mounted() {

	}
})