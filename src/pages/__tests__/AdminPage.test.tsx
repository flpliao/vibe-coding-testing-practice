import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminPage } from '../AdminPage';
import * as AuthContext from '../../context/AuthContext';
import * as ReactRouterDom from 'react-router-dom';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    Link: ({ to, children, className }: any) => (
        <a href={to} className={className}>
            {children}
        </a>
    ),
}));

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

describe('AdminPage', () => {
    const mockLogout = vi.fn();
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(ReactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);
    });

    const setup = (role: string = 'admin') => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { username: 'TestAdmin', role: role as any },
            logout: mockLogout,
            isAuthenticated: true,
            login: vi.fn(),
            authExpiredMessage: null,
            clearAuthExpiredMessage: vi.fn(),
            isLoading: false,
            token: 'token',
            checkAuth: vi.fn(),
        });

        return render(<AdminPage />);
    };

    describe('【前端元素】檢查 Admin 頁面元素是否正確渲染', () => {
        it('should render admin page elements correctly', () => {
            setup('admin');

            // 1. 看到「管理後台」標題
            expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();

            // 2. 看到「管理員專屬頁面」卡片
            expect(screen.getByText('管理員專屬頁面')).toBeInTheDocument();

            // 3. 看到「登出」按鈕
            expect(screen.getByText('登出')).toBeInTheDocument();

            // 4. 看到 role badge 顯示「管理員」
            expect(screen.getByText('管理員')).toBeInTheDocument();
        });
    });

    describe('【驗證權限】測試 Admin 權限訪問', () => {
        it('should render content for admin user', () => {
            setup('admin');

            // 期待輸出：正常渲染 Admin 頁面內容
            expect(screen.getByText('只有 admin 角色可以訪問')).toBeInTheDocument();
        });
    });

    // 修正：AdminPage 本身無重定向邏輯，此測試僅驗證 UI 顯示 user 狀態
    describe('【驗證權限】測試非 Admin 權限訪問 (UI顯示)', () => {
        it('should render as normal user if logic allows', () => {
            setup('user');

            // 期待輸出：顯示「一般用戶」Badge (雖然正常情況下會被 Route 擋下，但組件本身會依據 user 渲染)
            expect(screen.getByText('一般用戶')).toBeInTheDocument();
        });
    });

    describe('【function 邏輯】測試登出功能', () => {
        it('should logout and redirect to login', () => {
            setup('admin');

            // 點擊「登出」按鈕
            fireEvent.click(screen.getByText('登出'));

            // 期待輸出
            // 1. 呼叫 logout 方法
            expect(mockLogout).toHaveBeenCalled();
            // 2. 導向至 /login
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });

    describe('【前端元素】檢查返回連結', () => {
        it('should have correct back link', () => {
            setup('admin');

            // 點擊「返回」連結
            // 注意：Link 被 mock 成 a tag，這裡檢查屬性
            const link = screen.getByText('← 返回');
            expect(link).toHaveAttribute('href', '/dashboard');
        });
    });
});
