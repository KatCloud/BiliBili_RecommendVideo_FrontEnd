let token = ''
let haveOldToken = localStorage.getItem('access_token')

// 检查登录态
window.onload = function isLogin(){
	let idx = 0
	$('.guoqi').text('登录态检查...')
	$("#qrcode").hide()
	$.ajax({
		url: baseUrl + '/recommend/index',
		type: 'GET',
		data: {
			sessionID: haveOldToken,
			idx: idx
		},
		success: (res) => {
			if(res.state == 200){
				if(res.isLogin){
					$('.guoqi').text('已登录，3秒后跳转...')
					setTimeout(function(){
						window.location.href = 'biliVideoList.html'
					}, 3000)
				}else{
					$('.guoqi').text('二维码加载中...')
					getQRCode()
				}
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
			// console.log(res)
			token = res.token
			// console.log(token)
			if(res.state == 200){
				$('.guoqi').text('')	
				$("#qrcode").show()
				$("#qrcode").attr('src',res.qrCodeUrl)
			isScan()
			}else{
				$('.guoqi').text('二维码获取失败(' + res.data.code + ')')
			}
		}
	})
}

// 检查扫码情况
function isScan() {
	// console.log('in isScan')
	const scan = setTimeout(function(){
		$.ajax({
			url: baseUrl + '/login/scanToLogin',
			type: 'POST',
			data: {
				sessionID: token
			},
			success: function(res) {
				// console.log(res)
				if (res.state == 200) {
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
	const comfirm = setTimeout(function(){
		$.ajax({
			url: baseUrl + '/login/scanToLogin',
			type: 'POST',
			data: {
				sessionID: token
			},
			success: function(res) {
				console.log(res)
				if (res.data.code == 0) {
					// console.log('已经确认')
					localStorage.setItem('access_token', res.token)
					window.location.href = 'biliVideoList.html'
				}else if (res.state == 400) {
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