import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Megaphone, FileDigit, LogOut, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Campaigns', path: '/admin/campaigns', icon: Megaphone },
        { label: 'Spin Logs', path: '/admin/logs', icon: FileDigit },
        ...(user?.role === 'SUPER_ADMIN' ? [{ label: 'Users', path: '/admin/users', icon: Users }] : [])
    ];

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full z-10 hidden md:block">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-wider">SPIN ADMIN</h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase">{user?.role?.replace('_', ' ')}</p>
                </div>
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg w-full transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
