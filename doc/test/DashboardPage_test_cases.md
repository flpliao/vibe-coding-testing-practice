# DashboardPage 測試案例

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】檢查儀表板基本元素渲染
**範例輸入**：
1. Mock User (username: 'TestUser', role: 'user')
2. 進入 Dashboard 頁面
**期待輸出**：
1. 看到標題「儀表板」
2. 看到歡迎訊息 "Welcome, TestUser 👋"
3. 看到 role badge 顯示「一般用戶」
4. 看到「登出」按鈕

---

## [x] 【Mock API】測試商品列表載入成功
**範例輸入**：
1. Mock `productApi.getProducts` 回傳商品陣列
2. 進入 Dashboard 頁面
**期待輸出**：
1. 初始顯示「載入商品中...」
2. 載入後顯示商品列表 (檢查商品名稱、價格是否正確顯示)

---

## [x] 【Mock API】測試商品列表載入失敗
**範例輸入**：
1. Mock `productApi.getProducts` 失敗 (500 Error)
2. 進入 Dashboard 頁面
**期待輸出**：
1. 顯示錯誤訊息 (如「無法載入商品資料」)

---

## [x] 【前端元素】測試 Admin 連結顯示 (Admin 權限)
**範例輸入**：
1. Mock User role 為 'admin'
2. 進入 Dashboard 頁面
**期待輸出**：
1. 導航列顯示「🛠️ 管理後台」連結

---

## [x] 【前端元素】測試 Admin 連結隱藏 (User 權限)
**範例輸入**：
1. Mock User role 為 'user'
2. 進入 Dashboard 頁面
**期待輸出**：
1. 導航列 **不顯示**「🛠️ 管理後台」連結

---

## [x] 【function 邏輯】測試登出功能
**範例輸入**：點擊「登出」按鈕
**期待輸出**：
1. 呼叫 logout 方法
2. 導向至 `/login`

---
