import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoginPage } from '../LoginPage';
import * as AuthContext from '../../context/AuthContext';
import * as ReactRouterDom from 'react-router-dom';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

describe('LoginPage', () => {
    const mockLogin = vi.fn();
    const mockNavigate = vi.fn();
    const mockClearAuthExpiredMessage = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(ReactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);
    });

    const setup = (overrides = {}) => {
        const defaultAuthValues = {
            isAuthenticated: false,
            login: mockLogin,
            authExpiredMessage: null,
            clearAuthExpiredMessage: mockClearAuthExpiredMessage,
            isLoading: false,
            user: null,
            token: null,
            logout: vi.fn(),
            checkAuth: vi.fn(),
        };

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            ...defaultAuthValues,
            ...overrides,
        });

        return render(<LoginPage />);
    };

    describe('【前端元素】檢查登入頁面元素是否正確渲染', () => {
        it('should render login page elements correctly', () => {
            setup();
            
            // 1. 看到「歡迎回來」標題
            expect(screen.getByText('歡迎回來')).toBeInTheDocument();
            
            // 2. 看到 Email 輸入框
            expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
            
            // 3. 看到 密碼 輸入框
            expect(screen.getByLabelText('密碼')).toBeInTheDocument();
            
            // 4. 看到 登入 按鈕
            expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
        });
    });

    describe('【Mock API】測試登入成功流程', () => {
        it('should call login API and redirect to dashboard on success', async () => {
            setup();
            
            // 1. 輸入有效 Email
            const emailInput = screen.getByLabelText('電子郵件');
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            
            // 2. 輸入有效密碼
            const passwordInput = screen.getByLabelText('密碼');
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            
            // 3. 點擊登入按鈕
            const loginButton = screen.getByRole('button', { name: '登入' });
            fireEvent.click(loginButton);
            
            // 期待輸出
            // 1. 呼叫 login API
            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
            });
            
            // 2. 導向至 /dashboard
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });
    });

    describe('【Mock API】測試登入失敗流程', () => {
        it('should show error message when login fails', async () => {
            // Mock login 失敗
            mockLogin.mockRejectedValue({
                response: {
                    data: {
                        message: '帳號或密碼錯誤'
                    }
                }
            });
            setup();

            // 1. 輸入有效 Email
            fireEvent.change(screen.getByLabelText('電子郵件'), { target: { value: 'test@example.com' } });
            
            // 2. 輸入有效密碼
            fireEvent.change(screen.getByLabelText('密碼'), { target: { value: 'password123' } });
            
            // 3. 點擊登入按鈕
            fireEvent.click(screen.getByRole('button', { name: '登入' }));

            // 期待輸出
            // 1. 顯示錯誤訊息 banner
            await waitFor(() => {
                expect(screen.getByText('帳號或密碼錯誤')).toBeInTheDocument();
            });
        });
    });

    describe('【function 邏輯】測試 Email 格式驗證', () => {
        it('should show error for invalid email format', () => {
            setup();
            
            // 輸入無效 Email
            const emailInput = screen.getByLabelText('電子郵件');
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            
            // 提交
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            
            // 期待輸出：顯示錯誤訊息
            expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    describe('【function 邏輯】測試密碼長度驗證', () => {
        it('should show error for short password', () => {
            setup();
            
            // 輸入有效 Email
            fireEvent.change(screen.getByLabelText('電子郵件'), { target: { value: 'test@example.com' } });
            
            // 輸入少於 8 碼的密碼
            fireEvent.change(screen.getByLabelText('密碼'), { target: { value: 'pass1' } });
            
            // 提交
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            
            // 期待輸出
            expect(screen.getByText('密碼必須至少..liao 8 個字元')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    describe('【function 邏輯】測試密碼複雜度驗證', () => {
        it('should show error for password without numbers', () => {
            setup();
            
            // 輸入有效 Email
            fireEvent.change(screen.getByLabelText('電子郵件'), { target: { value: 'test@example.com' } });
            
            // 輸入僅有字母的密碼
            fireEvent.change(screen.getByLabelText('密碼'), { target: { value: 'passwordonly' } });
            
            // 提交
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            
            // 期待輸出
            expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    describe('【驗證權限】測試已登入狀態導向', () => {
        it('should redirect to dashboard if already authenticated', () => {
            // Mock isAuthenticated 為 true
            setup({ isAuthenticated: true });
            
            // 期待輸出：自動導向至 /dashboard
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });

    describe('【function 邏輯】測試 Session 過期訊息顯示', () => {
        it('should display auth expired message', () => {
            // Mock authExpiredMessage
            setup({ authExpiredMessage: 'Session Expired' });
            
            // 期待輸出
            // 1. 顯示錯誤 banner
            expect(screen.getByText('Session Expired')).toBeInTheDocument();
            
            // 2. 呼叫 clearAuthExpiredMessage
            expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
        });
    });
});
