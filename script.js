// 餐點資料
const menuItems = [
    { name: "雞胸肉餐盒", price: 180, category: "高蛋白", image: "image/chicken.webp" },
    { name: "牛排餐盒", price: 250, category: "高蛋白", image: "image/beef.webp" },
    { name: "藜麥沙拉", price: 150, category: "低糖", image: "image/quinoa_salad.webp" },
    { name: "糙米壽司", price: 120, category: "低糖", image: "image/brown_rice_sushi.webp" },
    { name: "綠色蔬菜拼盤", price: 130, category: "均衡飲食", image: "image/green_vegetables.webp" },
    { name: "鮭魚餐盒", price: 220, category: "均衡飲食", image: "image/salmon_meal.webp" }
];
// 稱號系統
const titles = [
    { title: "健康新手", condition: 1 },
    { title: "均衡飲食達人", condition: 5 },
    { title: "健康守護者", condition: 10 },
    { title: "營養專家", condition: 20 }
];
// 📌 取得歷史訂單
function getOrderHistory() {
    return JSON.parse(localStorage.getItem("orderHistory")) || [];
}

// 📌 取得稱號
function getUserTitle() {
    let orderCount = getOrderHistory().length;
    let userTitle = "未獲得稱號";

    for (let t of titles) {
        if (orderCount >= t.condition) {
            userTitle = t.title;
        }
    }
    return userTitle;
}

// 📌 更新稱號顯示
function updateTitleDisplay() {
    document.getElementById("title-display").innerText = `目前稱號：${getUserTitle()}`;
}

// 購物車陣列
let cart = [];

// 生成餐點列表
function displayMenu(category = "all", searchQuery = "") {
    const menuContainer = document.getElementById("menuContainer");
    menuContainer.innerHTML = "";

    menuItems.forEach((item, index) => {
        if ((category === "all" || item.category === category) && item.name.includes(searchQuery)) {
            const menuHTML = `
                <div class="col-md-4">
                    <div class="menu-item">
                        <img src="${item.image}" alt="${item.name}">
                        <h3>${item.name}</h3>
                        <p>價格: NT$ ${item.price}</p>
                        <p><strong>${item.category}</strong></p>
                        <button class="btn btn-success" onclick="addToCart(${index})">加入購物車</button>
                    </div>
                </div>
            `;
            menuContainer.innerHTML += menuHTML;
        }
    });
}

// 加入購物車
function addToCart(index) {
    cart.push(menuItems[index]);
    updateCart();
}

// 更新購物車顯示
function updateCart() {
    const cartList = document.getElementById("cartList");
    const totalPriceElement = document.getElementById("totalPrice");

    cartList.innerHTML = "";
    let totalPrice = 0;

    cart.forEach((item, index) => {
        totalPrice += item.price;
        cartList.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${item.name} - NT$ ${item.price}
                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">刪除</button>
            </li>
        `;
    });

    totalPriceElement.innerText = totalPrice;
}

// 移除購物車內的項目
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// 清空購物車
function clearCart() {
    cart = [];
    updateCart();
}

// 📌 **結帳**
function checkout() {
    let cart = getCart();
    if (cart.length === 0) {
        alert("購物車是空的，無法結帳！");
        return;
    }

    let total = cart.reduce((sum, item) => sum + item.price, 0);
    alert(`結帳成功！總金額：$${total}，感謝你的訂購！`);

    // ✅ 1. 加入歷史訂單
    let orderHistory = getOrderHistory();
    orderHistory.push(...cart);
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

    // ✅ 2. 清空購物車
    clearCart();

    // ✅ 3. 更新稱號
    updateTitleDisplay();

    // ✅ 4. 更新健康建議
    updateOrderHistory();
}
// 搜尋功能
document.getElementById("searchInput").addEventListener("input", function () {
    displayMenu(undefined, this.value);
});

// 篩選功能
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function () {
        const category = this.getAttribute("data-category");
        displayMenu(category);
    });
});

// 頁面加載時顯示所有餐點
document.addEventListener("DOMContentLoaded", () => displayMenu());

function subscribe() {
    let name = prompt("請輸入你的姓名：");
    if (name) {
        alert(name + "，感謝你的訂閱！健康餐盒即將為你準備！");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let planButtons = document.querySelectorAll(".card button");
    planButtons.forEach(button => {
        button.addEventListener("click", function () {
            alert("你選擇了：" + this.parentElement.querySelector("h3").innerText);
        });
    });
});
