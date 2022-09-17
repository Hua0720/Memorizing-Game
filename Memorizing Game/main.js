// 狀態機
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits", //還沒翻牌
  SecondCardAwaits: "SecondCardAwaits", // 翻第二次牌
  CardsMatchFailed: "CardsMatchFailed", // 配對失敗
  CardsMatched: "CardsMatched", // 配對成功
  GameFinished: "GameFinished", // 遊戲結束
}

// 宣告花色圖片
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

// 和介面有關的程式碼
const view = {
  getCardElement(index) { //牌背
    return `<div data-index="${index}" class="card back"></div>`
  },
  // 要做背面花色，所以設定一個牌背與正面
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1) //index 除以 13後的「餘數 +1」
    const symbol = Symbols[Math.floor(index / 13)] //加上 Math.floor 取整數
    return `
        <p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>`
  },

  // 特殊數字轉換：transformNumber (11、12、13、1 在卡牌上的呈現應為 J、Q、K、A)
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },


  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  // 翻牌
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        // HTML 回傳的是字串，要改成數字用 → Number 去轉換
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })

  },

  // 配對成功的顯示樣式
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  // 製作分數
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  // 製作操作的次數
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`;
  },
  // 事件監聽器 → 綁定邊框閃爍動畫的設定 
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  // 顯示遊戲結束畫面
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },
}

// 宣告 Model (和資料有關的程式碼)
const model = {
  revealedCards: [], // 被翻開的卡片

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0
}

// 宣告 Controller (和流程有關的程式碼)
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        // render嘗試的次數
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)

        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          //翻了兩張牌以後，如果配對成功，分數就要 +10
          view.renderScore(model.score += 10)
          //配對正確 //接續優化程式碼
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(model.revealedCards[0]) // 翻第一張牌(加入配對成功的顯示樣式)
          view.pairCards(model.revealedCards[1]) // 翻第二張牌(加入配對成功的顯示樣式)
          // model...配對成功後清空陣列
          model.revealedCards = []
          // 分數到達260分，遊戲結束
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          // 返回起始狀態
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards) // 呼叫 view 
          // 呼叫
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
  // 函式 
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

// 洗牌演算法 → 宣告另一個叫 utility 的模組來存放這個小工具
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        // 把陣列裡面的賦值做交換
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}


// view.displayCards()，更改↓
controller.generateCards()

// 每張卡片加上事件監聽器
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})
