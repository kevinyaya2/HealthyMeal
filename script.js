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
// 📌 餐點資料
const menuItems = [
    { name: "雞胸肉餐盒", price: 180, category: "高蛋白", image: "image/chicken.webp" },
    { name: "牛排餐盒", price: 250, category: "高蛋白", image: "image/beef.webp" },
    { name: "藜麥沙拉", price: 150, category: "低糖", image: "image/quinoa_salad.webp" },
    { name: "糙米壽司", price: 120, category: "低糖", image: "image/brown_rice_sushi.webp" },
    { name: "綠色蔬菜拼盤", price: 130, category: "均衡飲食", image: "image/green_vegetables.webp" },
    { name: "鮭魚餐盒", price: 220, category: "均衡飲食", image: "image/salmon_meal.webp" }
];

// 📌 稱號系統
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

// 📌 更新歷史訂單 & 健康建議
function updateOrderHistory() {
    let orderList = document.getElementById("order-list");
    let healthAdvice = document.getElementById("health-advice");
    let orders = getOrderHistory();

    orderList.innerHTML = "";
    let highProtein = 0, lowSugar = 0, balancedDiet = 0;

    if (orders.length === 0) {
        orderList.innerHTML = "<li class='list-group-item text-center'>尚無歷史訂單</li>";
        healthAdvice.innerText = "健康建議：請開始訂購健康餐盒！";
        return;
    }

    orders.forEach(order => {
        let listItem = document.createElement("li");
        listItem.className = "list-group-item";
        listItem.innerText = `餐點：${order.name} | 分類：${order.category} | 價格：NT$${order.price}`;
        orderList.appendChild(listItem);

        // 📌 統計餐點類別
        if (order.category === "高蛋白") highProtein++;
        if (order.category === "低糖") lowSugar++;
        if (order.category === "均衡飲食") balancedDiet++;
    });

    // 📌 根據訂單提供健康建議
    let advice = "健康建議：";
    if (highProtein > 2) {
        advice += "你攝取了大量高蛋白食物，記得搭配蔬菜保持均衡！";
    } else if (lowSugar > 2) {
        advice += "你的低糖飲食很棒，繼續維持！";
    } else if (balancedDiet > 2) {
        advice += "你維持了均衡飲食，這是最健康的選擇！";
    } else {
        advice += "建議多元化飲食，確保攝取足夠的營養！";
    }

    healthAdvice.innerText = advice;
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

// 📌 生成餐點列表
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

// 📌 **購物車處理**
let cart = JSON.parse(localStorage.getItem("cart")) || [];

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

    totalPriceElement.innerText = `總金額：NT$ ${totalPrice}`;
    localStorage.setItem("cart", JSON.stringify(cart));  
}

function addToCart(index) {
    cart.push(menuItems[index]);
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function clearCart() {
    cart = [];
    localStorage.removeItem("cart");
    updateCart();
}

// 📌 **結帳**
function checkout() {
    if (cart.length === 0) {
        alert("購物車是空的，無法結帳！");
        return;
    }

    let total = cart.reduce((sum, item) => sum + item.price, 0);
    alert(`結帳成功！總金額：NT$${total}，感謝你的訂購！`);

    let orderHistory = getOrderHistory();
    orderHistory.push(...cart);
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

    clearCart();
    updateTitleDisplay();
    updateOrderHistory();
}

// 📌 **頁面加載時，載入購物車 & 歷史訂單**
document.addEventListener("DOMContentLoaded", () => {
    updateCart();
    updateOrderHistory();
    updateTitleDisplay();
    displayMenu();
});
// 📌 清除歷史訂單
function clearOrderHistory() {
    if (confirm("確定要清除所有歷史訂單嗎？此操作無法恢復！")) {
        localStorage.removeItem("orderHistory");  // ❌ 刪除 localStorage 裡的歷史訂單
        updateOrderHistory();  // 🛠 立即更新畫面
        updateTitleDisplay();  // 🏆 更新稱號（如果稱號依賴歷史訂單）
        alert("歷史訂單已清除！");
    }
}

