new Vue({
	el: '#videoInfo',
	data: {
		// 工具版本号
		TOOL_VERSION: 2.1, // 2021.12.7 update
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
		reqErrMsg: ''
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
		
		// 处理获得的abID
		// 注意：在url中，av号是小写的，BV号是大写的。并且api参数为 aid=2333(不带av, 纯数字), bvid=BVxxxxxx 
		abIDCheck(){
			if(this.isEmpty(this.abId)){
				vant.Toast({
					type: 'html',
					message: '<h2 style="font-weight: normal;">请正确填写！</h2>',
					duration: 1200
				})
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
							id: id
						},
						success: (res) => {
							// console.log(res)
							if(res.state == 200){
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
					vant.Toast({
						type: 'html',
						message: '<h2 style="font-weight: normal;">请正确填写！</h2>',
						duration: 1200
					})
				}
			}
		}
	},
	created() {
		console.log(
		'\n' + ' %c B站封面获取工具 ' + ' %c v' + this.TOOL_VERSION + ' '
		+ '\n', 'color: #fadfa3; background: #030307; padding:5px 0;', 
		        'color: #242424; background: #fadfa3; padding:5px 0;');
	}
})