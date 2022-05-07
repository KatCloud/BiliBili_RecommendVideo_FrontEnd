new Vue({
    el: '#darts',
    data: {
        score: '', // 设定的总分
        // 规则
        rules: [
            {
                id: '1',
                value: '三局两胜'
            },
            {
                id: '2',
                value: '五局三胜'
            }
        ],
        // 选择的规则
        selectRule: '',
        // 游戏是否开始
        isGameStart: false,
        // 单次的分数
        singleScore_A: '',
        singleScore_B: '',
        // 剩余的分数
        remaining_A: 0,
        remaining_B: 0,
        // 胜利局数
        win_A: 0,
        win_B: 0,
        // 当前的玩家(默认玩家A先发)
        playerInGameNow: '1',
        // 游戏是否结束
        gameEnd: false
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

        // 信息提示
        showMessage(type, msg, duration = 4000) {
            this.$message({
                type: type,
                message: msg,
                duration: duration
            })
        },

        // 显示通知
        showNotify(type, title, msg, duration = 4500) {
            this.$notify({
                title: title,
                message: msg,
                offset: 100,
                type: type,
                duration: duration
            });
        },

        // 获得总分与规则
        getScoreAndRule() {
            const ruleId = this.selectRule
            const score = this.score
            console.log(ruleId + 'and' + score)
            if (this.isEmpty(ruleId) || this.isEmpty(score)) {
                this.showMessage('error', '总分不能为空！')
            } else {
                console.log('game start... ')
                this.gameStart(ruleId)
            }
        },

        // 进入游戏环节
        gameStart(ruleId) {
            this.isGameStart = true
            switch (this.isGameStart) {
                case ruleId == '1':
                    console.log('三局两胜')
                    this.remaining_A = this.score
                    this.remaining_B = this.score
                    break;
                case ruleId == '2':
                    // console.log('五局三胜')
                    this.remaining_A = this.score
                    this.remaining_B = this.score
                    break;

            }
        },

        // 玩家A单次提交
        submitSingleA() {
            console.log('A submit')
            const score = this.score
            const remaining = this.remaining_A
            const single = this.singleScore_A
            // this.remaining_A = score - single
            // 如果设定的总分数等于剩余的 或者 剩余的等于0， 即为首次
            if (score == remaining) {
                console.log('first_A')
                // 减去投中的分数，赋入剩余分数
                this.remaining_A = score - single
                // 切换到玩家2投掷
                this.playerInGameNow = '2'
                this.singleScore_A = ''
                this.singleScore_B = ''
            } else {
                console.log('继续计算')
                this.remaining_A = this.remaining_A - single
                this.playerInGameNow = '2'
                this.singleScore_A = ''
                this.singleScore_B = ''
            }
            console.log('A 剩余: ' + this.remaining_A)
            console.log('B 剩余: ' + this.remaining_B)
        },

        // 玩家B单次提交
        submitSingleB() {
            console.log('B submit')
            const score = this.score
            const remaining = this.remaining_B
            const single = this.singleScore_B
            // this.remaining_B = score - single
            // 如果设定的总分数等于剩余的 或者 剩余的等于0， 即为首次
            if (score == remaining) {
                console.log('first_B')
                // 减去投中的分数，赋入剩余分数
                this.remaining_B = score - single
                if (this.remaining_B == 0 && this.remaining_A != 0) {
                    this.showNotify('success', '本局结果出炉！', '玩家B胜利！', 6000)
                    // 剩余为0即为胜利
                    this.win_B = this.win_B + 1
                    if (this.selectRule == 1) {
                        this.bestOf_3()
                    } else {
                        this.bestOf_5()
                    }
                    // 重置为初始分数
                    this.remaining_A = this.score
                    this.remaining_B = this.score
                    this.singleScore_A = ''
                    this.singleScore_B = ''
                    this.playerInGameNow = '1'
                } else if (this.remaining_A == 0 && this.remaining_B != 0) {
                    this.showNotify('success', '本局结果出炉！', '玩家A胜利！', 6000)
                    // 剩余为0即为胜利
                    this.win_A = this.win_A + 1
                    if (this.selectRule == 1) {
                        this.bestOf_3()
                    } else {
                        this.bestOf_5()
                    }
                    // 重置为初始分数
                    this.remaining_A = this.score
                    this.remaining_B = this.score
                    this.singleScore_A = ''
                    this.singleScore_B = ''
                    this.playerInGameNow = '1'
                }
                // 切换到玩家2投掷
                this.playerInGameNow = '1'
                this.singleScore_A = ''
                this.singleScore_B = ''
            } else {
                console.log('继续计算')
                this.remaining_B = this.remaining_B - single
                if (this.remaining_B != 0 && this.remaining_A == 0) {
                    console.log('A win!!!')
                    // 玩家A胜利
                    this.showNotify('success', '本局结果出炉！', '玩家A胜利！', 6000)
                    // 剩余为0即为胜利
                    this.win_A = this.win_A + 1
                    if (this.selectRule == 1) {
                        this.bestOf_3()
                    } else {
                        this.bestOf_5()
                    }
                    // 重置为初始分数
                    this.playerInGameNow = '1'
                    this.remaining_A = this.score
                    this.remaining_B = this.score
                    this.singleScore_A = ''
                    this.singleScore_B = ''
                } else if (this.remaining_B == 0 && this.remaining_A != 0) {
                    console.log('B win!!!')
                    // 玩家B胜利
                    this.showNotify('success', '本局结果出炉！', '玩家B胜利！', 6000)
                    this.win_B = this.win_B + 1
                    if (this.selectRule == 1) {
                        this.bestOf_3()
                    } else {
                        this.bestOf_5()
                    }
                    // 重置为初始分数
                    this.playerInGameNow = '1'
                    this.remaining_A = this.score
                    this.remaining_B = this.score
                    this.singleScore_A = ''
                    this.singleScore_B = ''
                } else if ((this.remaining_B == 0 && this.remaining_A == 0) || (this.remaining_B < 0 && this.remaining_A < 0)) {
                    console.log('draw!!!')
                    this.showNotify('success', '本局结果出炉！', '平局！不计入分数！', 6000)
                    // 重置为初始分数
                    this.playerInGameNow = '1'
                    this.remaining_A = this.score
                    this.remaining_B = this.score
                    this.singleScore_A = ''
                    this.singleScore_B = ''
                } else if (this.remaining_A >= 0 && this.remaining_B < 0) {
                    // 玩家A胜利
                    this.showNotify('success', '本局结果出炉！', '玩家A胜利！', 6000)
                    // 剩余为0即为胜利
                    this.win_A = this.win_A + 1
                    if (this.selectRule == 1) {
                        this.bestOf_3()
                    } else {
                        this.bestOf_5()
                    }
                    // 重置为初始分数
                    this.playerInGameNow = '1'
                    this.remaining_A = this.score
                    this.remaining_B = this.score
                    this.singleScore_A = ''
                    this.singleScore_B = ''
                } else if (this.remaining_A < 0 && this.remaining_B >= 0) {
                    // 玩家A胜利
                    this.showNotify('success', '本局结果出炉！', '玩家B胜利！', 6000)
                    // 剩余为0即为胜利
                    this.win_B = this.win_B + 1
                    if (this.selectRule == 1) {
                        this.bestOf_3()
                    } else {
                        this.bestOf_5()
                    }
                    // 重置为初始分数
                    this.playerInGameNow = '1'
                    this.remaining_A = this.score
                    this.remaining_B = this.score
                    this.singleScore_A = ''
                    this.singleScore_B = ''
                }
            }
            this.playerInGameNow = '1'
            console.log('A 剩余: ' + this.remaining_A)
            console.log('B 剩余: ' + this.remaining_B)
        },

        // 三局两胜制
        bestOf_3() {
            if (this.win_A == 2) {
                this.gameEnd = true
                this.showNotify('success', '玩家A获得最终的胜利！', '好耶！', 0)
            } else if (this.win_B == 2) {
                this.gameEnd = true
                this.showNotify('success', '玩家B获得最终的胜利！', '好耶！', 0)
            } else {

            }
        },

        // 五局三胜制
        bestOf_5() {
            if (this.win_A == 3) {
                this.gameEnd = true
                this.showNotify('success', '玩家A获得最终的胜利！', '好耶！', 0)
            } else if (this.win_B == 3) {
                this.gameEnd = true
                this.showNotify('success', '玩家B获得最终的胜利！', '好耶！', 0)
            }
        },

        // 再来一把
        replay() {
            location.reload(true)
        }
    },
    created() {
        this.submitSingleA()
        this.submitSingleB()
    }
})