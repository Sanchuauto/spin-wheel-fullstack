import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Plus, Edit2, Play, Pause, ExternalLink } from 'lucide-react';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = async () => {
        try {
            const { data } = await api.get('/admin/campaigns');
            setCampaigns(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        try {
            await api.patch(`/admin/campaigns/${id}/${currentStatus ? 'deactivate' : 'activate'}`);
            fetchCampaigns();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Campaigns</h1>
                <Link
                    to="/admin/campaigns/new"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                >
                    <Plus size={18} />
                    Create Campaign
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Duration</th>
                            <th className="px-6 py-4 font-medium">Spins</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {campaigns.map((campaign) => (
                            <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{campaign.name}</div>
                                    <div className="text-xs text-gray-400 font-mono mt-1">{campaign.shareableSlug}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {campaign.isActive ? 'Active' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {campaign._count?.spinLogs || 0}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <a href={`/spin/${campaign.shareableSlug}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-primary transition-colors">
                                            <ExternalLink size={18} />
                                        </a>
                                        <button
                                            onClick={() => toggleStatus(campaign.id, campaign.isActive)}
                                            className={`p-2 rounded-lg transition-colors ${campaign.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`}
                                            title={campaign.isActive ? "Deactivate" : "Activate"}
                                        >
                                            {campaign.isActive ? <Pause size={18} /> : <Play size={18} />}
                                        </button>
                                        <Link
                                            to={`/admin/campaigns/${campaign.id}`}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {campaigns.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">No campaigns found. Create one to get started.</div>
                )}
            </div>
        </div>
    );
};

export default Campaigns;
