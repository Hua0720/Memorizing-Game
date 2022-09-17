const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/' //電影的網址
const POSTER_URL = BASE_URL + '/posters/' //圖片的網址
const MOVIES_PER_PAGE = 12 //網頁頁面要呈現12個電影卡片(4*3)

const movies = [] //電影總清單
let filteredMovies = [] //搜尋清單

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator') // 宣告分頁


function renderMovieList(data) {
  let rawHTML = ''


  // 每一個項目所以用item命名
  data.forEach(item => {
    console.log(item)
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


  dataPanel.innerHTML = rawHTML
}

// 分頁功能製作
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''
  // for迴圈製作分頁
  for (let page = 1; page <= numberOfPages; page++) {
    // 綁data-page在a標籤上
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}


function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release Date:' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 綁定事件,設置監聽器,當點擊more按鈕時要顯示電影有的資料
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // 是不是點擊到more按鈕，若不是就return掉
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 綁定分頁監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

// 在searchForm上面掛上監聽器，監聽搜尋表單提交 (submit) 事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 請瀏覽器不要做預設動作
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter((movies) =>
    movies.title.toLowerCase().includes(keyword)
  )


  if (filteredMovies.length === 0) {
    return alert('Cannot find movie with keyword: ' + keyword)
  }

  //重製分頁器
  renderPaginator(filteredMovies.length)
  //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))
})



axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))

  })
  .catch((err) => console.log(err))

