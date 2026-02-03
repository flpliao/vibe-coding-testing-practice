# LoginPage 測試案例

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】檢查登入頁面元素是否正確渲染
**範例輸入**：進入登入頁面
**期待輸出**：
1. 看到「歡迎回來」標題
2. 看到 Email 輸入框
3. 看到 密碼 輸入框
4. 看到 登入 按鈕

---

## [x] 【Mock API】測試登入成功流程
**範例輸入**：
1. 輸入有效 Email (如 `test@example.com`)
2. 輸入有效密碼 (如 `password123`)
3. 點擊登入按鈕
**期待輸出**：
1. 呼叫 login API
2. 導向至 `/dashboard`

---

## [x] 【Mock API】測試登入失敗流程
**範例輸入**：
1. 輸入有效 Email
2. 輸入錯誤密碼
3. 點擊登入按鈕
4. Mock login 失敗回傳 401
**期待輸出**：
1. 顯示錯誤訊息 banner (如「登入失敗」)

---

## [x] 【function 邏輯】測試 Email 格式驗證
**範例輸入**：輸入無效 Email (如 `invalid-email`) 並提交
**期待輸出**：Email 欄位下方顯示「請輸入有效的 Email 格式」錯誤訊息

---

## [x] 【function 邏輯】測試密碼長度驗證
**範例輸入**：輸入少於 8 碼的密碼 (如 `pass1`) 並提交
**期待輸出**：密碼欄位下方顯示「密碼必須至少 8 個字元」錯誤訊息

---

## [x] 【function 邏輯】測試密碼複雜度驗證
**範例輸入**：輸入僅有數字或僅有字母的密碼 (如 `passwordonly`) 並提交
**期待輸出**：密碼欄位下方顯示「密碼必須包含英文字母和數字」錯誤訊息

---

## [x] 【驗證權限】測試已登入狀態導向
**範例輸入**：
1. Mock `isAuthenticated` 為 true
2. 進入登入頁面
**期待輸出**：自動導向至 `/dashboard`

---

## [x] 【function 邏輯】測試 Session 過期訊息顯示
**範例輸入**：
1. Mock `authExpiredMessage` 為 "Session Expired"
2. 進入登入頁面
**期待輸出**：
1. 顯示內容為 "Session Expired" 的錯誤 banner
2. 呼叫 `clearAuthExpiredMessage`

---
