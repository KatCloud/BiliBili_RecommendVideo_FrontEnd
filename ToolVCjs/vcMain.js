let token = localStorage.getItem('vcs_token')

new Vue({
	el: '#versionControl',
	data: {
		// form control
		id: '', // 表单中toolId
		allVersion: [],
		newVersion: '',
		pushName: '',
		inputDisabled: true,
		notifyPromise: Promise.resolve()
	},
	methods: {
		// 处理空字符串
		isEmpty(str) {
		    if (typeof str == "undefined" || str == null || str == "" || $.trim(str) == null || $.trim(str) == "") {
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
		
		// 获取所有工具版本号
		getAllVersion(){
			// 全屏加载
			const loading = this.$loading({
				lock: true,
				text: 'Loading',
				background: 'rgba(0, 0, 0, 0.7)'
			})
			$.ajax({
				url: baseUrl + '/vc/getAllVersion',
				type: 'GET',
				success: (res) => {
					// console.log(res)
					if(res.code == 200){
						this.allVersion = res.data
						// console.log(this.allVersion)
						loading.close()
						this.showMessage('success', '已从数据库获取所有工具最新版本号')
					}else{
						this.showMessage('error', '从获取版本号失败，请检查后端log!')
						loading.close()
					}
				}
			})
		},

		// 选择器onChange
		selectChange(){
			// console.log(this.id)
			const id = this.id
			this.inputDisabled = false
			// 获取对应的version 写入 input
			this.newVersion = this.allVersion.slice(id-1, id)[0].toolVersion
			this.pushName = this.allVersion.slice(id-1, id)[0].toolName
		},

		// 表单检查
		submitVersion(){
			const id = this.id
			const version = this.newVersion
			const pushName = this.pushName
			if(this.isEmpty(version)){
				// this.showNotify('error', '错误', '版本号不能为空！', 0)
				this.showMessage('error', '版本号不能为空！', 4500);
			}else if(this.newVersion === this.allVersion.slice(id-1, id)[0].toolVersion){
				this.showMessage('error', '与原版本号不能一致！', 4500)
			}else{
				this.pushConfirm(id, version, pushName)
			}
		},

		// 提交前确认
		pushConfirm(id, version, pushName) {
		    this.$confirm( '提交的版本号：' + version + '</br>' 
						+ '要更新的工具：' + pushName + '</br>'
						+ '更新版本号前请确保相关文件已更新至服务器！' + '</br>'
						+ '<strong>是否更新版本号?</strong> ' + '</br>' , '危险操作', {
		      confirmButtonText: '确定',
		      cancelButtonText: '取消',
		      type: 'warning',
			  closeOnHashChange: false,
			  dangerouslyUseHTMLString: true
		    }).then(() => {
		      this.pushVersion(id, version)
		    }).catch(() => {         
		    });
		},

		// 提交版本号更新
		pushVersion(toolId, version){
			// 全屏加载
			const loading = this.$loading({
				lock: true,
				text: 'Loading',
				background: 'rgba(0, 0, 0, 0.7)'
			})
			$.ajax({
				url: baseUrl + '/vc/updateToolVersion',
				type: 'POST',
				Headers: {
					'Access-Control-Allow-Origin': '*'
				},
				data: {
					vcsToken: token,
					toolId: toolId,
					version: version
				},
				success: (res) => {
					// console.log(res)
					loading.close()
					if(res.code == 200 && res.data == 1){
						this.showMessage('success', '已成功更新版本号！')
						this.getAllVersion()
					}else{
						this.showMessage('error', '更新版本号出现错误 code：' + res.data)
					}
				}
			})
		},
		
		// 登录态检查
		checkLogin(){
			// 全屏加载
			const loading = this.$loading({
				lock: true,
				text: '登录态检查',
				background: 'rgba(0, 0, 0, 0.7)'
			})
            $.ajax({
                url: baseUrl + '/vc/checkLogin',
                type: 'GET',
                data: {
                    vcsToken: token
                },
                success: (res) => {
					loading.close()
                    if(res.code == 200){
						// console.log(res)
                        if(res.data.isLogin){
                            this.getAllVersion()
                        }else{
							this.showMessage('info', '未登陆，正在跳转...')
                            setTimeout(function(){
                                window.location.href = 'biliVCLogin.html'
                            }, 2000)
						}
                    }else{
                        this.showMessage('error', '检查登录态出错！(' + res.code + ')')
                    }
                }
            })
        },

		// 提交前确认
		logoutConfirm() {
		    this.$confirm('是否要退出版本控制系统？', '提醒', {
		      confirmButtonText: '确定',
		      cancelButtonText: '取消',
		      type: 'warning',
			  closeOnHashChange: false,
		    }).then(() => {
		      this.logOut()
		    }).catch(() => {         
		    });
		},

		// 退出登录
		logOut(){
			// 全屏加载
			const loading = this.$loading({
				lock: true,
				text: '登录态检查',
				background: 'rgba(0, 0, 0, 0.7)'
			})
			$.ajax({
				url: baseUrl + '/vc/logout',
				type: 'GET',
				data: {
					vcsToken: token
				},
				success: (res) => {
					loading.close()
					if(res.code == 200){
						window.location.href = 'biliVCLogin.html'
					}
				}
			})
		}

	},
	created() {
		this.checkLogin()
		console.log(
			'\n' + ' %c KatCloud版本控制工具 ' + ' %c v' + '1.0' + ' ' +
			'\n', 'color: #fadfa3; background: #030307; padding:5px 0;',
			'color: #242424; background: #fadfa3; padding:5px 0;');
	}
})
