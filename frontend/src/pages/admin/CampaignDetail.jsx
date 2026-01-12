import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Trash2, Edit, Plus, Save } from 'lucide-react';

const CampaignDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [campaign, setCampaign] = useState({
        name: '',
        brandLogoUrl: '',
        startDate: '',
        endDate: '',
        maxSpinsPerPhone: 1,
        offers: []
    });
    const [loading, setLoading] = useState(!isNew);
    const [offerForm, setOfferForm] = useState(null); // null = hidden, object = editing/new

    useEffect(() => {
        if (!isNew) {
            fetchCampaign();
        }
    }, [id]);

    const fetchCampaign = async () => {
        try {
            const { data } = await api.get(`/admin/campaigns/${id}`);
            // Format dates for input type=date
            const formatted = {
                ...data,
                startDate: data.startDate.split('T')[0],
                endDate: data.endDate.split('T')[0]
            };
            setCampaign(formatted);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCampaign = async (e) => {
        e.preventDefault();
        try {
            if (isNew) {
                const { data } = await api.post('/admin/campaigns', campaign);
                navigate(`/admin/campaigns/${data.id}`);
            } else {
                await api.put(`/admin/campaigns/${id}`, campaign);
                alert('Campaign updated');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Save failed');
        }
    };

    const handleSaveOffer = async (e) => {
        e.preventDefault();
        try {
            if (offerForm.id) {
                await api.put(`/admin/offers/${offerForm.id}`, offerForm);
            } else {
                await api.post(`/admin/campaigns/${id}/offers`, offerForm);
            }
            fetchCampaign();
            setOfferForm(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Save offer failed');
        }
    };

    const handleDeleteOffer = async (offerId) => {
        if (!confirm('Delete this offer?')) return;
        try {
            await api.delete(`/admin/offers/${offerId}`);
            fetchCampaign();
        } catch (error) {
            alert('Failed to delete offer');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{isNew ? 'New Campaign' : 'Edit Campaign'}</h1>
                {!isNew && (
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">Slug: {campaign.shareableSlug}</div>
                )}
            </div>

            {/* Campaign Form */}
            <form onSubmit={handleSaveCampaign} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Campaign Name</label>
                    <input
                        required
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                        value={campaign.name}
                        onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Brand Logo URL (Optional)</label>
                    <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                        value={campaign.brandLogoUrl || ''}
                        onChange={(e) => setCampaign({ ...campaign, brandLogoUrl: e.target.value })}
                    />
                    {campaign.brandLogoUrl && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Preview:</p>
                            <img
                                src={campaign.brandLogoUrl}
                                alt="Logo Preview"
                                className="max-w-[120px] h-auto rounded-lg shadow-sm border border-gray-200"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <p style={{ display: 'none' }} className="text-xs text-red-500 mt-1">Failed to load image</p>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                    <input
                        required
                        type="date"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                        value={campaign.startDate}
                        onChange={(e) => setCampaign({ ...campaign, startDate: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                    <input
                        required
                        type="date"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                        value={campaign.endDate}
                        onChange={(e) => setCampaign({ ...campaign, endDate: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Max Spins Per User</label>
                    <input
                        required
                        type="number"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                        value={campaign.maxSpinsPerPhone}
                        onChange={(e) => setCampaign({ ...campaign, maxSpinsPerPhone: e.target.value })}
                    />
                </div>
                <div className="flex items-end">
                    <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                        <Save size={18} />
                        Save Campaign
                    </button>
                </div>
            </form>

            {/* Offers Section */}
            {!isNew && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Has Offers</h2>
                        <button
                            onClick={() => setOfferForm({ offerName: '', offerDescription: '', couponCode: '', weight: 1, maxRedemptionLimit: 100 })}
                            className="flex items-center gap-2 bg-secondary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-600 transition-colors"
                        >
                            <Plus size={16} /> Add Offer
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {campaign.offers?.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No offers added yet.</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm">
                                    <tr>
                                        <th className="px-6 py-3">Offer Name</th>
                                        <th className="px-6 py-3">Code</th>
                                        <th className="px-6 py-3">Weight</th>
                                        <th className="px-6 py-3">Redeemed</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {campaign.offers.map((offer) => (
                                        <tr key={offer.id}>
                                            <td className="px-6 py-3">{offer.offerName}</td>
                                            <td className="px-6 py-3 font-mono text-sm">{offer.couponCode}</td>
                                            <td className="px-6 py-3">{offer.weight}</td>
                                            <td className="px-6 py-3 text-sm text-gray-500">{offer.redemptionCount} / {offer.maxRedemptionLimit}</td>
                                            <td className="px-6 py-3 text-right">
                                                <button onClick={() => setOfferForm(offer)} className="p-2 text-blue-500 hover:bg-blue-50 rounded mr-2"><Edit size={16} /></button>
                                                <button onClick={() => handleDeleteOffer(offer.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Offer Modal */}
            {offerForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{offerForm.id ? 'Edit Offer' : 'New Offer'}</h3>
                        <form onSubmit={handleSaveOffer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Offer Name</label>
                                <input required type="text" className="w-full border rounded px-3 py-2" value={offerForm.offerName} onChange={e => setOfferForm({ ...offerForm, offerName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input type="text" className="w-full border rounded px-3 py-2" value={offerForm.offerDescription || ''} onChange={e => setOfferForm({ ...offerForm, offerDescription: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                                <input required type="text" className="w-full border rounded px-3 py-2" value={offerForm.couponCode} onChange={e => setOfferForm({ ...offerForm, couponCode: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Weight</label>
                                    <input required type="number" className="w-full border rounded px-3 py-2" value={offerForm.weight} onChange={e => setOfferForm({ ...offerForm, weight: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max Limit</label>
                                    <input required type="number" className="w-full border rounded px-3 py-2" value={offerForm.maxRedemptionLimit} onChange={e => setOfferForm({ ...offerForm, maxRedemptionLimit: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setOfferForm(null)} className="flex-1 px-4 py-2 border rounded text-gray-600">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded">Save Offer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignDetail;
