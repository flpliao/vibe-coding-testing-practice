import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from '../DashboardPage';
import * as AuthContext from '../../context/AuthContext';
import { productApi } from '../../api/productApi';
import * as ReactRouterDom from 'react-router-dom';

// Mocks
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    Link: ({ to, children, className }: any) => (
        <a href={to} className={className}>
            {children}
        </a>
    ),
}));

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../api/productApi', () => ({
    productApi: {
        getProducts: vi.fn(),
    },
}));

describe('DashboardPage', () => {
    const mockLogout = vi.fn();
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(ReactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);
    });

    const setup = (role: string = 'user', products = []) => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { username: 'TestUser', role: role as any },
            logout: mockLogout,
            isAuthenticated: true,
            login: vi.fn(),
            authExpiredMessage: null,
            clearAuthExpiredMessage: vi.fn(),
            isLoading: false,
            token: 'token',
            checkAuth: vi.fn(),
        });
        return render(<DashboardPage />);
    };

    describe('【前端元素】檢查儀表板基本元素渲染', () => {
        it('should render basic elements correctly', async () => {
            // Mock empty products to stop loading
            vi.spyOn(productApi, 'getProducts').mockResolvedValue([]);
            setup('user');

            // Wait for loading to finish
            await waitFor(() => expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument());

            // 1. 看到標題「儀表板」
            expect(screen.getByText('儀表板')).toBeInTheDocument();

            // 2. 看到歡迎訊息 "Welcome, TestUser 👋"
            expect(screen.getByText(/Welcome, TestUser/)).toBeInTheDocument();

            // 3. 看到 role badge 顯示「一般用戶」
            expect(screen.getByText('一般用戶')).toBeInTheDocument();

            // 4. 看到「登出」按鈕
            expect(screen.getByText('登出')).toBeInTheDocument();
        });
    });

    describe('【Mock API】測試商品列表載入成功', () => {
        it('should fetch and display products', async () => {
            const mockProducts = [
                { id: 1, name: 'Product A', price: 100, description: 'Desc A' },
                { id: 2, name: 'Product B', price: 200, description: 'Desc B' },
            ];
            vi.spyOn(productApi, 'getProducts').mockResolvedValue(mockProducts as any);
            setup();

            // 1. 初始顯示「載入商品中...」
            expect(screen.getByText('載入商品中...')).toBeInTheDocument();

            // 2. 載入後顯示商品列表
            await waitFor(() => {
                expect(screen.getByText('Product A')).toBeInTheDocument();
                expect(screen.getByText('Product B')).toBeInTheDocument();
                // Check Price formatting "NT$ 100"
                expect(screen.getByText('NT$ 100')).toBeInTheDocument();
            });
        });
    });

    describe('【Mock API】測試商品列表載入失敗', () => {
        it('should display error message on fetch failure', async () => {
            vi.spyOn(productApi, 'getProducts').mockRejectedValue({
                response: { data: { message: 'Network Error' } }
            });
            setup();

            await waitFor(() => {
                // 顯示錯誤訊息
                expect(screen.getByText('Network Error')).toBeInTheDocument();
            });
        });
    });

    describe('【前端元素】測試 Admin 連結顯示 (Admin 權限)', () => {
        it('should show admin link for admin user', async () => {
            vi.spyOn(productApi, 'getProducts').mockResolvedValue([]);
            setup('admin');

            await waitFor(() => expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument());

            // 1. 導航列顯示「🛠️ 管理後台」連結
            expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
        });
    });

    describe('【前端元素】測試 Admin 連結隱藏 (User 權限)', () => {
        it('should hide admin link for normal user', async () => {
            vi.spyOn(productApi, 'getProducts').mockResolvedValue([]);
            setup('user');

            await waitFor(() => expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument());

            // 1. 導航列 不顯示「🛠️ 管理後台」連結
            expect(screen.queryByText('🛠️ 管理後台')).not.toBeInTheDocument();
        });
    });

    describe('【function 邏輯】測試登出功能', () => {
        it('should call logout and redirect', async () => {
            vi.spyOn(productApi, 'getProducts').mockResolvedValue([]);
            setup();

            await waitFor(() => expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument());

            // 點擊「登出」按鈕
            fireEvent.click(screen.getByText('登出'));

            // 1. 呼叫 logout 方法
            expect(mockLogout).toHaveBeenCalled();
            // 2. 導向至 /login
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });
});
