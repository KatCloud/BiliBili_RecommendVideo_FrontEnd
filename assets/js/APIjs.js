new Vue({
	el: '#videoInfo',
	data: {
		// 工具版本号
		TOOL_VERSION: '3.1', // 2022.1.16 update
		toolId: 2,
		// 显示结果框, 0 不显示, 1 正确获取, 2 错误获取, 3 获取中
		showResult: 0,
		// 输入的AV或BV号
		abId: '',
		// 获得的AV号
		reqAid: '',
		// 获得的BV号
		reqBvid: '',
		// 获得的标题
		reqTitle: '',
		// 获得的封面地址
		reqPicUrl: '',
		// 获得的错误信息
		reqErrMsg: '',
		notifyPromise: Promise.resolve()
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

		// 显示通知
		showNotify(type, title, msg, duration = 4500){
			this.notifyPromise = this.notifyPromise.then(this.$nextTick).then(() => {
				this.$notify({
				    title: title,
				    message: msg,
					offset: 100,
					type: type,
					duration: duration
				});
			})
		},

		// 信息提示
		showMessage(type, msg, duration = 4000){
			this.$message({
				type: type,
				message: msg,
				duration: duration
			})
		},
		
		// 处理获得的abID
		// 注意：在url中，av号是小写的，BV号是大写的。并且api参数为 aid=2333(不带av, 纯数字), bvid=BVxxxxxx 
		abIDCheck(){
			if(this.isEmpty(this.abId)){
				this.showMessage('error', '不能为空！')
			}else{
				const id = this.abId
				const cut = id.slice(0,2)
				
				// console.log(id.slice(0,2).toLowerCase())
				if(cut == 'av' || cut == 'BV'){
					this.showResult = 3
					$.ajax({
						url: baseUrl + '/getVideoInfo',
						type: 'GET',
						data: {
							videoId: id
						},
						success: (res) => {
							// console.log(res)
							if(res.code == 200 || res.data.code == 0){
								// 写入
								this.reqAid = res.data.data.aid
								this.reqBvid = res.data.data.bvid
								this.reqTitle = res.data.data.title
								this.reqPicUrl = res.data.data.pic
								this.showResult = 1
							}else{
								this.reqErrMsg = res.data.data.message
								this.showResult = 2
							}
						}
					})
				}else{
					this.showMessage('error', '请正确填写！')
				}
			}
		},

		// 获取工具最新版本
		updateNewestVersion(){
			$.ajax({
				url: baseUrl + '/vc/getToolVersion',
				type: 'GET',
				data:{
					toolId: this.toolId
				},
				success: (res) => {
					// console.log(res)
					if(res.code == 200){
						let newestVersion = res.data.toolVersion
						if(this.TOOL_VERSION === newestVersion){
							// console.log('nothing to update')
						}else{
							// console.log('update available')
							this.showMessage('error', '网页已有新版本，3秒后更新', 0)
							setTimeout(function(){
								// console.log('已更新好')
								window.location.reload(true)
							}, 3000)
						}
					}else{
						this.showMessage('error', '获取更新失败！(' + res.code + ')')
					}
				}
			})
		}
	},
	created() {
		this.updateNewestVersion()
		console.log(
		'\n' + ' %c B站封面获取工具 ' + ' %c v' + this.TOOL_VERSION + ' '
		+ '\n', 'color: #fadfa3; background: #030307; padding:5px 0;', 
		        'color: #242424; background: #fadfa3; padding:5px 0;');
	}
})