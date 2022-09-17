const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";

const users = JSON.parse(localStorage.getItem('favoriteUsers')) || []


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
            <button class="btn btn-outline-danger btn-sm btn-remove-favoriteUser" data-id="${user.id}">X</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  dataPanel.innerHTML = rawHTML;
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

// 
function removeFromFavorite(id) {
  if (!users || !users.length) return

  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return

  users.splice(userIndex, 1)

  localStorage.getItem('favoriteUsers', JSON.stringify(users))

  UserList(users)
}


// 綁定事件,設置監聽器,當點擊more按鈕時顯示User資料
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-list")) {
    showUserModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-remove-favoriteUser")) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
});

UserList(users)

