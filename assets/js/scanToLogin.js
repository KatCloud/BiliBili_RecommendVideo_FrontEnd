let token = ''
let haveOldToken = localStorage.getItem('access_token')

// 检查登录态
window.onload = function isLogin(){
	let idx = 0
	$('.guoqi').text('登录态检查...')
	$("#qrcode").hide()
	$.ajax({
		url: baseUrl + '/getVideoList',
		type: 'GET',
		data: {
			loginToken: haveOldToken,
			idx: idx
		},
		success: (res) => {
			if(res.code == 200){
				if(res.data.isLogin){
					$('.guoqi').text('已登录，3秒后跳转...')
					setTimeout(function(){
						window.location.href = 'biliVideoList.html'
					}, 3000)
				}else{
					$('.guoqi').text('二维码加载中...')
					getQRCode()
				}
			}else{
				$('.guoqi').text('服务器错误，请刷新页面再试。错误代码：' + res.code)
			}
		}
	})
}
	
// 拿二维码url
function getQRCode(){
	$.ajax({
		url: baseUrl + '/login/getQRcode',
		type: 'GET',
		success: function(res) {
			token = res.data.token
			// console.log(res)
			if(res.code == 200){
				$('.guoqi').text('')	
				$("#qrcode").show()
				$("#qrcode").attr('src', res.data.qrCodeUrl)
			isScan()
			}else{
				$('.guoqi').text('二维码获取失败(' + res.code + ')')
			}
		}
	})
}

// 检查扫码情况
function isScan() {
	// console.log('in isScan')
	// console.log(token)
	setTimeout(function(){
		$.ajax({
			url: baseUrl + '/login/scanToLogin',
			type: 'POST',
			data: {
				token: token
			},
			success: function(res) {
				// console.log(res)
				if (res.code == 200) {
					if (res.data.code == 86039) {
						// code = 86039，已扫描，未确认
						isComfirm()
					}else {
						isScan()
					}
				}
			}
		})
	}, 1500)
}

// 检查二维码确认情况
function isComfirm() {
	// console.log('in isComfirm')
	setTimeout(function(){
		$.ajax({
			url: baseUrl + '/login/scanToLogin',
			type: 'POST',
			data: {
				token: token
			},
			success: function(res) {
				// console.log(res)
				if (res.code == 200 && res.data.code == 0) {
					// console.log('已经确认')
					localStorage.setItem('access_token', res.data.loginToken)
					getThirdPartKeyAndGo()
				}else if (res.code == 500 || res.data.code == 86038) {
					// console.log('二维码已过期')
					$('#qrcode').attr('style', 'filter: blur(10px)')
					$('.guoqi').text('二维码已过期，请刷新当前页面')
				}else {
					isComfirm()
				}
			}
		})
	}, 1500)
}

// 获取第三方key再跳转
function getThirdPartKeyAndGo(){
	let loginToken = localStorage.getItem('access_token')
	$.ajax({
		url: baseUrl + '/logThirdPart',
		type: 'GET',
		data: {
			loginToken:  loginToken
		},
		success: function(res){
			if (res.code == 200){
				$('#qrcode').attr('style', 'filter: blur(10px)')
				$('.guoqi').text('已确认登录，正在跳转...')
				window.location.href = 'biliVideoList.html'
			}else {
				$('.guoqi').text('登录失败！（' + res.code + '）')
			}
		}
	})
}