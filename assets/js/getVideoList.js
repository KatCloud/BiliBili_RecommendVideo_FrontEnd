let token = localStorage.getItem('access_token')

let Component = Vue.extend({
	template: '<p></p>'
})
Vue.component('go-top', Component)
Vue.config.productionTip = false
new Vue({
	el: '#videoList',
	data: {
		// 工具版本号
		biliToolVersion: '5.2', // 2023.1.10 update
		toolId: 1,
		// ---------
		// 骨架屏
		isSkeleton: false,
		skelist: [1, 2, 3, 4, 5, 6],
		// ---------
		videolist: [],
		retryRecommend: 0,
		isLogin: false,
		isLoading: false,
		// 推荐列表索引
		idx: 0,
		// 临时list
		item: [],
		loading: false,
		notifyPromise: Promise.resolve(),
		fullScreenLoading: false,
		loadMoreFlag: false,
		// 已关注直播列表
		liveList: [],
		isLoadLive: false,
		retryLive: 0,
		// 检查动态新发视频
		dynamicCount: 0,
		isDynamicHide: true,
		// 搜索
		keyWord: '',
		// 不喜欢视频的index
		dislikeIndex: -1,
		// 用户信息
		face: '',
		level: '',
		vip: '',
		nickName: ''
	},
	methods: {
		// 处理空字符串
		isEmpty(obj) {
			if (typeof obj == "undefined" || obj == null || obj == "" || obj.trim() == null || obj.trim() == "") {
				return true;
			} else {
				return false;
			}
		},

		// 处理用户等级
		userBadge(level, vip) {
			if (!this.isEmpty(vip)) {
				return 'lv.' + level + '  ' + vip
			} else {
				return 'lv.' + level
			}
		},

		// 搜索
		search() {
			window.open('https://search.bilibili.com/all?keyword=' + this.keyWord, '_blank')
			this.keyWord = ''
		},

		// 判断是否为广告，活动等，是就返回false
		checkRcmdCard(param, card_goto) {
			if (!this.isEmpty(param)) {
				if (card_goto.indexOf('ad') == -1 && card_goto.indexOf('banner') == -1) {
					return true
				} else {
					return false
				}
			} else {
				return false
			}
		},

		// 显示判断
		checkGoto(goto, card_goto) {
			let isHaveUp = ['av', 'vertical_av', 'live', 'article', 'picture']
			let isHaveAd = ['ad', 'banner']
			if (isHaveUp.includes(goto)) {
				if (isHaveAd.includes(card_goto)) {
					return false
				} else {
					return true
				}
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

		// 显示通知（自定义）
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

		// 显示被风控通知
		show412Note() {
			this.notifyPromise = this.notifyPromise.then(this.$nextTick).then(() => {
				this.$notify({
					title: '风控警告',
					message: '当前请求过多，暂被风控，请稍后再试！',
					offset: 100,
					type: 'error',
					duration: 0,
					showClose: true
				});
			})
		},

		// 信息提示（自定义）
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

		//  秒数转化为时分秒
		formatSeconds(value) {
			//  秒
			let second = parseInt(value)
			//  分
			let minute = 0
			//  小时
			let hour = 0
			//  天
			//  如果秒数大于60，将秒数转换成整数
			if (second > 60) {
				//  获取分钟，除以60取整数，得到整数分钟
				minute = parseInt(second / 60)
				//  获取秒数，秒数取佘，得到整数秒数
				second = parseInt(second % 60)
				//  如果分钟大于60，将分钟转换成小时
				if (minute > 60) {
					//  获取小时，获取分钟除以60，得到整数小时
					hour = parseInt(minute / 60)
					//  获取小时后取佘的分，获取分钟除以60取佘的分
					minute = parseInt(minute % 60)
				}
			}
			let result = '' + parseInt(second)
			if (parseInt(second) < 10) {
				if (second > 0 && minute <= 0) {
					result = '0:' + '0' + parseInt(second)
				}
				if (minute > 0) {
					result = '' + parseInt(minute) + ':' + '0' + result
				}
				if (hour > 0) {
					result = '' + parseInt(hour) + ':' + '0' + result
				}
			} else {
				if (second > 0 && minute <= 0) {
					result = '0:' + parseInt(second)
				}
				if (minute > 0) {
					result = '' + parseInt(minute) + ':' + result
				}
				if (hour > 0) {
					result = '' + parseInt(hour) + ':' + result
				}
			}
			// if (second > 0 && minute <= 0) {
			// 	result = '0:' + parseInt(second)
			// }
			// if (minute > 0) {
			// 	result = '' + parseInt(minute) + ':' + result
			// }
			// if (hour > 0) {
			// 	result = '' + parseInt(hour) + ':' + result
			// }
			return result
		},

		// 播放量简写
		shortPlayCount(value) {
			let result = ''
			if (value < 10000) {
				result = value
			} else if (value >= 10000) {
				let num = value / 10000
				result = num.toFixed(1) + '万'
			} else if (value >= 100000) {
				let num = value / 10000
				result = num.toFixed(1) + '万'
			} else {
				let num = value / 10000
				result = num.toFixed(0) + '万'
			}
			return result;
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
				timeout: 15000,
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
					} else if (res.code == 200 && res.data.code == 412) {
						this.show412Note()
					} else {
						this.showNotify('error', '添加稍后再看出现问题', '错误代码: ' + res.code + ',错误信息：' + res.msg)
					}
				},
				complete: (res, status) => {
					if (status == 'timeout') {
						this.showNotify('error', '错误', '加载超时，请重试', 0)
						loading.close()
					} else if (res.status == 0 && status == 'error') {
						this.showNotify('error', '错误', '加载超时，请刷新页面或检查网络状况')
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
					// console.log(res)
					if (res.code == 200) {
						this.videolist.splice(index, 1)
						this.showNotify('success', '已反馈', '将减少此类内容推荐', 2000)
						this.dislikeIndex = -1
					} else {
						this.showNotify('error', '反馈失败！', '错误代码: ' + res.code + ',错误信息：' + res.msg)
						this.dislikeIndex = -1
					}
				}
			})
		},
		// 下拉列表	END -----------------------------------------------------------------------------------------------------------		

		// 检查用户登录态
		checkBiliLoginStatus() {
			const checkLogin = this.$message({
				type: 'info',
				message: '正在进行登录态检查...',
				duration: 0
			})
			this.isSkeleton = true
			$.ajax({
				url: baseUrl + '/loginCheck',
				type: 'GET',
				timeout: 15000,
				data: {
					loginToken: token
				},
				success: (res) => {
					if (res.code == 200) {
						if (res.data.isLogin) {
							this.isLogin = true
							this.face = res.data.data.face
							this.level = res.data.data.level
							this.nickName = res.data.data.name
							if (res.data.data.vip) {
								this.vip = res.data.data.vip.label.text
							}
							checkLogin.close()
							this.getVideoList()
						} else {
							checkLogin.close()
							this.getVideoList()
						}
					} else {
						checkLogin.close()
						this.showNotify('error', '检查登录态错误', '遇到未知问题，请稍后再试！')
					}
				},
				complete: (res, status) => {
					if (status == 'timeout') {
						this.showNotify('error', '错误', '登录态检查超时，请重试。')
						checkLogin.close()
					} else if (res.status == 0 && status == 'error') {
						this.showNotify('error', '获取错误', '遇到未知问题，请稍后再试！')
						checkLogin.close()
					}
				}
			})
		},

		// 获取用户关注的直播列表
		getLiveList() {
			this.liveList = []
			this.isLoadLive = true
			$.ajax({
				url: baseUrl + '/getLiveList',
				type: 'GET',
				timeout: 15000,
				data: {
					loginToken: token
				},
				success: (res) => {
					// console.log(res)
					if (res.code == 200) {
						this.retryLive = 0
						if (res.data.data.count == 0) {
							$('#liveNotification').text('还没有人开播哦~')
						} else {
							this.isLoadLive = false
							this.liveList = res.data.data.items
						}
					} else {
						if (this.retryLive < 5) {
							const retry = this.retryLive
							this.retryLive = retry + 1
							// this.showNotify('error', '获取直播列表错误', '错误代码: ' + res.code + ',错误信息：' + res.msg)
							$('#liveNotification').text('出现错误，正在再次获取关注的直播...(' + this.retryLive + '/5' + ')')
							this.getLiveList()
						} else {
							$('#liveNotification').text('获取关注的直播失败，请重试。')
							this.showNotify('error', '获取直播列表错误', '获取直播列表多次失败，请刷新页面重试。')
						}
					}
				},
				complete: (res, status) => {
					if (status == 'timeout') {
						$('#liveNotification').text('获取关注的直播超时，请重试。')
						this.showNotify('error', '错误', '获取直播列表超时，请重试。')
					} else if (res.status == 0 && status == 'error') {
						this.showNotify('error', '获取错误', '获取直播列表错误，请稍后再试吧！')
					}
				}
			})
		},

		// 拿视频列表（首次）
		getVideoList() {
			const rcmd_load = this.$message({
				type: 'info',
				message: '正在获取推荐视频...',
				duration: 0
			})
			$.ajax({
				url: baseUrl + '/getVideoList',
				timeout: 15000,
				type: 'GET',
				data: {
					loginToken: token,
					idx: this.idx,
					isLogin: this.isLogin
				},
				success: (res) => {
					// console.log(res)
					// this.isLoading = false
					// loading.close()
					if (res.code == 200) {
						// 列表
						const videoList = res.data.data.items
						// 获取头尾idx
						// const headIdx = res.data.data.items.slice(0, 1)[0].idx
						// const footIdx = res.data.data.items.slice(-1)[0].idx
						// // 判断获取的数组是正序还是倒序
						// if (this.isHeadBiggerThanFoot(headIdx, footIdx)) {
						// 	// headIdx is max
						// 	this.idx = headIdx
						// 	// idx大的放最后
						// 	this.videolist = videoList.reverse()
						// } else {
						// 	// footIdx is max
						// 	this.idx = footIdx
						// 	this.videolist = videoList
						// }
						this.videolist = videoList
						this.isSkeleton = false
						// 登录鉴定
						if (this.isLogin) {
							this.isLoadLive = true
							this.getLiveList()
							this.getDynamicCount()
							this.showNotify('info', '提示', '已登录', 1500)
						} else {
							this.showNotify('warning', '提示', '由于你尚未登录，为你获取全站推荐视频，或点击登录按钮登录')
						}
					} else {
						this.showNotify('error',
							'获取推荐视频列表时出现问题',
							'请重试！（错误代码: ' + res.code + '，错误信息：' + res.msg + ')')
						this.isSkeleton = false
					}
					rcmd_load.close()
				},
				complete: (res, status) => {
					// console.log(res)
					// console.log(status)
					if (status == 'timeout') {
						this.showNotify('error', '错误', '加载超时，请重试', 0)
						this.isSkeleton = false
						rcmd_load.close()
					} else if (res.status == 0 && status == 'error') {
						this.showNotify('error', '获取错误', '获取推荐视频错误，请稍后再试吧！')
						this.isSkeleton = false
						rcmd_load.close()
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
				timeout: 15000,
				type: 'GET',
				data: {
					loginToken: token,
					idx: this.idx,
					isLogin: this.isLogin
				},
				success: (res) => {
					if (res.code == 200) {
						// 列表
						const moreVideoList = res.data.data.items
						// console.log(moreVideoList)
						// 获取头尾idx
						const headIdx = res.data.data.items.slice(0, 1)[0].idx
						this.idx = headIdx
						// const footIdx = res.data.data.items.slice(-1)[0].idx
						// // 判断获取的数组是正序还是倒序
						// if (this.isHeadBiggerThanFoot(headIdx, footIdx)) {
						// 	// 
						// 	this.idx = headIdx
						// 	// 原列表正序
						// 	const videoList = this.videolist
						// 	// 将获得的列表正序并接在原列表后
						// 	this.videolist = videoList.concat(moreVideoList.reverse())
						// 	// 赋值
						// 	// this.videolist = newList
						// } else {
						// 	// 正序
						// 	this.idx = footIdx
						// 	// 将原列表正序
						// 	const videoList = this.videolist
						// 	// 将获得的列表接在原列表后
						// 	this.videolist = videoList.concat(moreVideoList)
						// 	// 赋值
						// 	// this.videolist = newList
						// }
						let oldVideoList = this.videolist
						oldVideoList.push.apply(oldVideoList, moreVideoList)
						console.log(this.videolist)
						this.showNotify('success', '好耶', '获得' + moreVideoList.length + '条新内容', 1000)
						// 登录鉴定
						if (!this.isLogin) {
							this.showNotify('warning', '提示', '由于你尚未登录，为你获取全站推荐视频，或点击登录按钮登录')
						}
						loading.close()
					} else {
						loading.close()
						this.showNotify('error',
							'获取推荐视频列表时出现问题',
							'请重试！（错误代码: ' + res.code + '，错误信息：' + res.msg + ')')
					}
				},
				complete: (res, status) => {
					// console.log(res)
					// console.log(status)
					if (status == 'timeout') {
						this.showNotify('error', '错误', '加载超时，请重试', 0)
						loading.close()
					} else if (res.status == 0 && status == 'error') {
						this.showNotify('error', '获取错误', '获取推荐视频错误，请稍后再试吧！')
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
				timeout: 15000,
				type: 'GET',
				data: {
					loginToken: token
				},
				success: (res) => {
					// loading.close()
					if (res.code == 200) {
						this.isLogin = false
						localStorage.removeItem('access_token')
						this.showNotify('success', '提示', '你已退出登录')
						this.videoList = []
						this.isSkeleton = true
						this.getVideoList()
					} else {
						this.showNotify('error', '退出登录时出现问题',
							'错误代码: ' + res.code + ',错误信息：' + res.msg)
					}
				},
				complete: (status) => {
					if (status == 'timeout') {
						this.showNotify('error', '错误', '加载超时，请重试', 0)
					} else if (res.status == 0 && status == 'error') {
						this.showNotify('error', '获取错误', '获取推荐视频错误，请稍后再试吧！')
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
			}, 120000)
		},

		// 拿动态角标
		getDynamicCount() {
			let count = this.dynamicCount
			$.ajax({
				url: baseUrl + '/getDynamicCount',
				timeout: 20000,
				type: 'GET',
				data: {
					loginToken: token
				},
				success: (res) => {
					// console.log(res)
					if (res.code == 200) {
						let alltype = res.data.data.alltype_num
						if (parseInt(alltype) != 0) {
							this.dynamicCount = parseInt(alltype) + parseInt(count)
							this.isDynamicHide = false
						}
					}
				}
			})
		},

		// 点击动态按钮时，计数清零
		clickDynamicBtn() {
			this.dynamicCount = 0
			this.isDynamicHide = true
		},

		// 获取工具最新版本
		updateNewestVersion() {
			$.ajax({
				url: baseUrl + '/vc/getToolVersion',
				timeout: 20000,
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
							this.checkBiliLoginStatus()
						} else {
							// console.log('update available')
							// 全屏加载
							const loading = this.$loading({
								lock: true,
								text: '请先更新再使用！',
								background: 'rgba(0, 0, 0, 0.7)'
							})
							this.showNotify('warning', '工具已有更新!', '按下Ctrl + F5即可更新！', 0, false)
						}
					} else {
						this.showNotify('error', '获取更新失败！(' + res.code + ')')
					}
				},
				complete: (status) => {
					if (status.statusText == 'timeout') {
						this.showNotify('error', '错误', '加载超时，请刷新页面', 0)
					} else if (status.statusText == 'error') {
						this.showNotify('warning', '维护提示', '工具当前维护中，请稍后再试！', 0)
					}
				}
			})
		}
	},
	created() {
		console.log(
			'\n' + ' %c Bili Recommend Tool ' + ' %c v' + this.biliToolVersion + ' '
			+ '\n', 'color: #fadfa3; background: #030307; padding:5px 0;',
			'color: #242424; background: #fadfa3; padding:5px 0;');
	},
	mounted() {
		this.updateNewestVersion()
		this.timer()
	},
	destroyed() {
		clearTimeout(this.timer)
	}
})