const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const USERS_PER_PAGE = 12 //網頁頁面要呈現12個電影卡片(4*3)

const users = [];
let filteredUsers = []


const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector('#paginator') // 宣告分頁

// 建立每位user的list
function UserList(data) {
  let rawHTML = "";
  data.forEach((user) => {
    rawHTML += `
    <div class="col-sm-2">
      <div class="mb-2">
        <div class="card">
          <img src="${user.avatar}" class="card-img-top" alt="User img">
          <div class="card-body">
            <h5 class="card-title">${user.name} ${user.surname}</h5>
          </div>
          <div class="card-footer text-end">
            <button class="btn btn-outline-primary btn-sm btn-show-list " data-bs-toggle="modal"
                  data-bs-target="#User-modal" data-id="${user.id}">More</button>
            <button class="btn btn-outline-danger btn-sm btn-add-favoriteUser" data-id="${user.id}">+</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

// 分頁功能製作 (需知道有多少分頁，所以用amount)
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
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


// page -> 第幾頁就顯示那一頁的電影卡片
function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  //切割起點
  const startIndex = (page - 1) * USERS_PER_PAGE
  // 切割的起點跟終點。
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}


function showUserModal(id) {
  const modalTitle = document.querySelector("#User-modal-title");
  const modalImage = document.querySelector("#User-modal-image");
  const modalInfo = document.querySelector("#User-modal-info");

  // 參考Model Answer，清空上一個 user 的資料殘影
  modalTitle.textContent = "";
  modalImage.textContent = "";
  modalInfo.textContent = "";

  // 運用API連結，建立每位user的詳細資料及照片
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const user = response.data;
      modalTitle.innerText = `${user.name} ${user.surname}`;
      modalImage.innerHTML = `<img src="${user.avatar}" alt="User-poster" class="img-fluid">`;
      modalInfo.innerHTML = `
      <p class="user-gender">Gender: ${user.gender}</p>
      <p class="user-age">Age: ${user.age}</p>
      <p class="user-region">Region: ${user.region}</p>
      <p class="user-birthday">Birthday: ${user.birthday}</p>
      <p class="user-email">Email: ${user.email}</p>`;
    })
    .catch((err) => console.log(err));
}

// 加好友到 favorite list
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find((user) => user.id === id)
  if (list.some((user) => user.id === id)) {
    return alert('此好友已經在收藏清單中！')
  }
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

// 綁定事件,設置監聽器,當點擊more按鈕時顯示User資料
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-list")) {
    showUserModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favoriteUser")) {
    addToFavorite(Number(event.target.dataset.id))
  }
});

// 綁定分頁監聽器，當點擊 + 按鈕時加入favorite list
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  UserList(getUsersByPage(page))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
    // UserList(users);
    renderPaginator(users.length);
    UserList(getUsersByPage(1))
  })
  .catch((err) => console.log(err));