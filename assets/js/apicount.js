// 获取数据
var list_time = []
var list_rcmd = []
var list_pic = []
var list_watchlater = []
var list = []
let rcmd = '/bili/getVideoList'
let pic = '/bili/getVideoInfo'
let wl = '/bili/addWatchLater'


window.onload = function getData(){
    myChart.showLoading()
    $.ajax({
        url: baseUrl + '/apiCount',
        type: 'GET',
        success: (res) => {
            if(res.code == 200 || res.data != null){
                var list_rcmd_ls = res.data.getVideoList
                var list_pic_ls = res.data.getVideoInfo
                var list_watchlater_ls = res.data.addWatchLater
                // 找值赋值...
                list_rcmd_ls.forEach(e => {
                    list_rcmd.push(e.count)
                    list_time.push(e.time)
                });
                list_pic_ls.forEach(e => {
                    list_pic.push(e.count)
                    // list_time.push(e.time)
                });
                list_watchlater_ls.forEach(e => {
                    list_watchlater.push(e.count)
                    // list_time.push(e.time)
                });

                // console.log(list_rcmd)
                // console.log(list_pic)
                // console.log(list_watchlater)
                // console.log(list_time)                
                myChart.hideLoading()
                myChart.setOption({
                    xAxis: {
                        // 时间
                        data: list_time
                    },
                    series: [
                    {
                        name: '推荐视频',
                        data: list_rcmd,
                      },
                      {
                          name: '获取封面',
                          data: list_pic,
                      },
                      {
                          name: '稍后再看',
                          data: list_watchlater,
                      }
                    ]
                })
            }
        }
    })
}

// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('mychart'));

// 指定图表的配置项和数据
var option = {
  title: {
    text: 'API使用情况统计',
    subtext: '单位：次'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['推荐视频','获取封面','稍后再看']
  },
  xAxis: {
    // 时间
    data: ['2023-01-01', '2023-01-02', '2023-01-03']
  },
  yAxis: {
  },
  series: [
    {
      name: '推荐视频',
      type: 'line',
      data: [5, 8, 10],
      smooth: true
    },
    {
        name: '获取封面',
        type: 'line',
        data: [3, 10 ,23],
        smooth: true
    },
    {
        name: '稍后再看',
        type: 'line',
        data: [10, 19, 28],
        smooth: true
    }
  ]
};

// 使用刚指定的配置项和数据显示图表
myChart.setOption(option);