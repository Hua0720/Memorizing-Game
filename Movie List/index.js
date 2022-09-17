const BASE_URL = 'https://movie-list.alphacamp.io' //原先為:https://movie-list.alphacamp.io/api/v1/movies
const INDEX_URL = BASE_URL + '/api/v1/movies/' //電影的網址
const POSTER_URL = BASE_URL + '/posters/' //圖片的網址
const MOVIES_PER_PAGE = 12 //網頁頁面要呈現12個電影卡片(4*3)

const movies = [] //電影總清單
let filteredMovies = [] //搜尋清單-->把filteredMovies拿出來變成全域變數，讓search的地方也可以存取到

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator') // 宣告分頁


// 取名 (data) 而不用movies是因為當有其他資料時,需要被重複使用到函式,若綁死了就無法被重複利用
// 讓每一個函示都只做一件事情
function renderMovieList(data) {
  let rawHTML = '' //負責裝解析data後的HTML

  // processing 
  // data傳進來是renderMovieList的陣列,所以用forEach
  // 每一個項目所以用item命名
  data.forEach(item => {
    //console.log(item)後看到結果,知道我們需要:title,image
    console.log(item)
    // src、title 內需要加入變數，才能隨著每一個陣列去放入對應的資訊與圖片
    // 每一個item都有新的html code,所以要把它串起來就用 += 
    rawHTML += `<div class="col-sm-3">         
        <div class="mb-2">
          <div class="card">
            <img
              // src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster"> 
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">              
              <button class="btn btn-primary btn-show-movie " data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })


  dataPanel.innerHTML = rawHTML // 把rawHTML放進去dataPanel元素下
}

// 分頁功能製作 (需知道有多少分頁，所以用amount)
function renderPaginator(amount) {
  //計算總頁數
  //ex: 電影總數 80 / 分頁顯示卡片數 12 = 6(頁)...8(餘數) = 7(頁)，有小數點無條件進位，所以用Math.ceil
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''
  // for迴圈製作分頁
  for (let page = 1; page <= numberOfPages; page++) {
    // 綁data-page在a標籤上，是因為點取分頁時，作動的是超連結，也就是a標籤內的，也可以把a當作是一個按鈕去理解。
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

// step1---------------------------------------------------
// // page -> 第幾頁就顯示那一頁的電影卡片
// function getMoviesByPage(page) {
//   //切割起點
//   const startIndex = (page - 1) * MOVIES_PER_PAGE

//   // 切割的起點跟終點。page1 -> 回傳 movies 第0-11部；page2 -> 回傳 movies 第12-23部 ...
//   return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
// }

// step2------------------------------------------
// 因為要有"movies" 跟 "filteredMovie" 兩種分頁顯示狀況，所以更改getMoviesByPage函式內的程式碼
function getMoviesByPage(page) {
  //如果搜尋清單filteredMovies內有東西，那就給我搜尋清單filteredMovies，那如果搜尋清單filteredMovies內是空陣列，那就回傳總清單movies到data內。
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //修改這裡
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


// 設定id這個值是因為，每一部電影的id都不同
// rawHTML內的button-->more，要設定data-id的變數，為了綁定當點擊more按鈕後，出現每一部電影相對應的資訊。
// 若是要綁不同的值，都可以綁在元素上
// const 宣告設定每一個值相對應的資訊
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      // response.data.results
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release Date:' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
}

// 做一個函式 ， 把id找出來丟進去localStorage裡
// 要把localStorage內的東西拿出來，若取回來是false那就回傳一個空陣列。
// 左邊 || 右邊 <--若回傳值都為 true 那就以左邊的回傳值為優先。
// localStorage.getItem回傳回來會是字串，所以加上JSON的方式把'陣列'或'物件'轉成字串。
// find可看做--> function isMovieIdMatched(movie){return movie.id === id}
// find(函式) ， 也就是抓取值出來 符合id的 就丟回去給movie，回傳值為元素本身，在找到第一個符合條件的 item 後就回停下來回傳該 item。
// const jsonString = JSON.stringify(list)
// console.log('json string: ',jsonString)
// console.log('json object: ', JSON.parse(jsonString))
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) { // some --> 回傳list這個陣列裡面，有沒有通過檢查條件的元素，有就回傳
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list)) // 把list用JSON轉成字串,回傳至localStorage內
}

// ---------------------------------------監聽器---------------------------------------------------------------
// 綁定事件,設置監聽器,當點擊more按鈕時要顯示電影有的資料
// 用function onPanelClicked(event)方式，除錯時才可以知道是哪一個函式錯誤,比起匿名函式:('click',(event) 的方式好。
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // 是不是點擊到more按鈕，若不是就return掉
  // matches('.btn-show-movie') 是指點擊到的物件是否包含.btn-show-movie(選擇器指定的 class name)
  if (event.target.matches('.btn-show-movie')) {
    // dataset -->指所有被綁在上面的data，都會變成一個object來呈現
    // console.log(event.target.dataset)
    // step1--用Number是因為id=" " 出來的值是一個字串，所以要用Number的函式轉換成數字
    // showMovieModal(Number(event.target.dataset.id))

    // step2--若是把id先轉成數字再跟url字串串接，因為JavaScript type coercion的特性，id還是會被轉回成字串，所以這裡認為沒必要轉換成Number
    showMovieModal(event.target.dataset.id)
    // step3--因為要製作收藏名單,所以多加一個條件式,點擊 + 按鈕加入收藏清單
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 綁定分頁監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 如果被點擊的不是 a 標籤，結束 (A 指的是a標籤)
  // 在 HTML 文檔中，tagName會返回其大寫型式。對於元素節點來說，tagName 屬性的值和nodeName屬性的值是相同的。
  if (event.target.tagName !== 'A') return
  // console.log(event.target.dataset.page) 印出結果檢查

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

// 在searchForm上面掛上監聽器，監聽搜尋表單提交 (submit) 事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 請瀏覽器不要做預設動作
  event.preventDefault()
  // console.log(searchInput.value)<--印出看能否搜尋到所搜尋的關鍵字
  // toLowerCase 把字串都改為小寫,這樣搜尋時就不會有大小寫的問題
  const keyword = searchInput.value.trim().toLowerCase()
  // let filteredMovie = [] --> 搜尋清單，目前只存活在 onSearchFormSubmitted 這個函式的大括弧裡。

  // length (若值=0 布林值會回傳 false),所以加上 ! 會回傳true
  // ('請輸入有效字串！')
  // if (!keyword.length) {
  //   return alert('Please enter a valid string')
  // }

  // step1 (for迴圈)-------------------------------------
  // includes 用法是搜尋的字有沒有在title裡面，如果沒有就回傳false
  // 若搜尋的關鍵字(keyword)有包含在title裡面，那就把filteredMovie結果推進去到movie內
  // .toLowerCase() 兩邊都要放置
  //   for (const movie of movies) {
  //     if (movie.title.toLowerCase().includes(keyword)) {
  //       filteredMovie.push(movie)
  //     }
  //   }
  //   renderMovieList(filteredMovie)
  // })

  // step2 (filter)-------------------------------------
  // filter是陣列使用方法，(括號內需要的參數是一個條件函數)，把movies丟到裡面檢查，若元素為true回傳,若為false就丟掉
  // map, filter, reduce
  filteredMovies = movies.filter((movies) =>
    movies.title.toLowerCase().includes(keyword)
  )

  // 條件是判斷:跳出無法找到關鍵字的視窗提醒 + (輸入的文字)
  if (filteredMovies.length === 0) {
    return alert('Cannot find movie with keyword: ' + keyword) // or(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  // renderMovieList(filteredMovies)

  //重製分頁器
  renderPaginator(filteredMovies.length)
  //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))
})



axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    // Array(80個元素)
    //------------------------------step1 (for迴圈)-------------------------------------
    // movies印出後發現包了兩層的Array(80),只需要出現陣列物件,所以使用for-of 迭代器,把 response.data.results 陣列中的元素一個個拿出來，再推進 movies 裡
    // for (const movie of response.data.results ){
    //   movies.push(movie)
    // }

    // 把 傳回來的資料push回去[陣列]中
    // movies.push(response.data.results)

    //------------------------------step2 (...展開運算子)-------------------------------------
    // 加上...(三個點點就是展開運算子),他的主要功用是「展開陣列元素」
    movies.push(...response.data.results)

    // step1-------------------------
    // renderMovieList(movies) // 呼叫renderMovieList,要render一整個movies的陣列，console.log(movies)檢查

    // 呼叫 renderPaginator()，並傳入資料的總筆數
    renderPaginator(movies.length)

    // step2--------------------------
    // 要變成每一頁只顯示12個電影卡片，所以呼叫render的部分應更改，不能使用整個movies的回傳值
    renderMovieList(getMoviesByPage(1)) // 從第1個分頁開始顯示

  })
  .catch((err) => console.log(err))


// 開始製作收藏清單---------------------------------------------------
// 開發人員->Application->Local Storage,網頁重整都會顯示預設語言(english)
// localStorage.setItem('key', '字串')<--只能放字串，若要放其他元素就要-->('default_language', JSON.stringify(物件or陣列))運用JSON的函式轉換為字串。
// localStorage.setItem('default_language', 'english')
