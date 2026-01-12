import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Download, Filter, Search } from 'lucide-react';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        phone: '',
        from: '',
        to: ''
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const { data } = await api.get(`/admin/spins?${params.toString()}`);
            setLogs(data.logs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []); // Initial load

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams(filters);
            const response = await api.get(`/admin/spins/export?${params.toString()}`, {
                responseType: 'blob', // Important
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `spin_logs_${new Date().toISOString()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Export failed');
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Spin Logs</h1>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-auto flex-1">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            value={filters.phone}
                            onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                            placeholder="Search by phone..."
                        />
                    </div>
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-500 mb-1">From Date</label>
                        <input
                            type="date"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            value={filters.from}
                            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                        />
                    </div>
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-500 mb-1">To Date</label>
                        <input
                            type="date"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            value={filters.to}
                            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                        <Search size={18} />
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Campaign</th>
                            <th className="px-6 py-4 font-medium">Phone</th>
                            <th className="px-6 py-4 font-medium">Won Offer</th>
                            <th className="px-6 py-4 font-medium">Coupon</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No logs found</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {log.campaign.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                        {log.phone}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {log.offerNameSnapshot}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-primary font-mono">
                                        {log.couponCodeSnapshot}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Logs;
