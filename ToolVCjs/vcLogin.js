let oldToken = localStorage.getItem('vcs_token')

new Vue({
	el: '#versionControl',
	data: {
		// form control
		username: '',
		password: '',
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

		// 表单检查
		submitCheck(){
			const username = this.username
			const password = this.password
			if(this.isEmpty(username) || this.isEmpty(password)){
				this.$message.error('用户名或密码不能为空！', 4500);
			}else{
				this.submitPush(username, password)
			}
		},

        // 发送请求
        submitPush(username, password){
            // 全屏加载
			const loading = this.$loading({
				lock: true,
				text: 'Loading',
				background: 'rgba(0, 0, 0, 0.7)'
			})
            $.ajax({
                url: baseUrl + '/vc/login',
                type: 'POST',
                Headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                data: {
                    username: username,
                    password: password
                },
                success: (res) => {
                    console.log(res)
                    loading.close()
                    if(res.code == 200 && res.data.query == 0){
                        localStorage.setItem('vcs_token', res.data.token)
                        window.location.href = 'biliVC.html'
                    }else{
                        this.showMessage('error', '用户名或密码错误！')
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
                    vcsToken: oldToken
                },
                success: (res) => {
                    loading.close()
                    if(res.code == 200){
                        if(res.data.isLogin){
                            this.showMessage('info', '已经登陆，正在跳转...')
                            setTimeout(function(){
                                window.location.href = 'biliVC.html'
                            }, 2000)
                        }    
                    }else{
                        this.showMessage('error', '检查登录态出错！(' + res.code + ')')
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
