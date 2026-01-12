import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Loader2, Users, Trophy, PlayCircle } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/analytics/summary');
                setStats(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>;

    const chartData = {
        labels: stats?.spinsPerDay?.map(d => new Date(d.date).toLocaleDateString()) || [],
        datasets: [
            {
                label: 'Spins Per Day',
                data: stats?.spinsPerDay?.map(d => d.count) || [],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                tension: 0.3
            }
        ]
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Spins</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats?.totalSpins || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                            <PlayCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Campaigns</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats?.activeCampaigns || 0}</h3>
                        </div>
                    </div>
                </div>

                {/* Placeholders for other stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Users</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Spin Activity (Last 7 Days)</h3>
                <div className="h-80 w-full relative">
                    <Line options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
