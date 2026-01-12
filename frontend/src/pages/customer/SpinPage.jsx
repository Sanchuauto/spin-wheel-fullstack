import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import WheelComponent from '../../components/WheelComponent';
import ResultModal from '../../components/ResultModal';
import { Smartphone, Loader2, AlertCircle } from 'lucide-react';

const SpinPage = () => {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState(null);
    const [phone, setPhone] = useState('');
    const [phoneSubmitted, setPhoneSubmitted] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [winningIndex, setWinningIndex] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCampaign();
    }, [slug]);

    const fetchCampaign = async () => {
        try {
            const { data } = await api.get(`/public/campaign/${slug}`);
            setCampaign(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load campaign');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        // Allow only digits
        const numericValue = value.replace(/\D/g, '');
        setPhone(numericValue);

        // Clear error when user starts typing
        if (error) setError('');
    };

    const handlePhoneSubmit = (e) => {
        e.preventDefault();

        if (!phone) {
            setError('Please enter your phone number');
            return;
        }

        if (phone.length !== 10) {
            setError('Phone number must be exactly 10 digits');
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            setError('Phone number must contain only digits');
            return;
        }

        setError('');
        setPhoneSubmitted(true);
    };

    const isPhoneValid = phone.length === 10 && /^\d{10}$/.test(phone);

    const [pendingResult, setPendingResult] = useState(null);

    const spin = async () => {
        if (spinning) return;
        setSpinning(true);
        setError('');
        setPendingResult(null);

        try {
            // API Call
            const { data } = await api.post('/public/spin', { slug, phone });

            // Determine index based on result
            const index = campaign.offers.findIndex(o => o.offerName === data.offerName);

            if (index !== -1) {
                setWinningIndex(index);
                setPendingResult(data);
                // The actual state updates and modal trigger will happen in handleSpinFinish
            } else {
                throw new Error('Winning offer not found in list');
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Spin failed. Please try again.');
            setSpinning(false);
        }
    };

    const handleSpinFinish = () => {
        if (pendingResult) {
            setResult(pendingResult);
            setPendingResult(null);
        }
        setSpinning(false);
        setWinningIndex(null);
    };

    const resetGame = () => {
        setResult(null);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    if (!campaign && error) return <div className="min-h-screen flex items-center justify-center p-4 text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-[#0b1026] text-white flex flex-col items-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0b1026] via-[#1c1246] to-[#3a1a66] z-0"></div>
            <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]"></div>

            <div className="z-10 w-full max-w-md flex flex-col h-full min-h-screen">
                {/* Header with Logo */}
                <header className="p-6 text-center">
                    {/* Brand Logo Container */}
                    <div className="mx-auto mb-6 w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 overflow-hidden">
                        {campaign?.brandLogoUrl ? (
                            <img
                                src={campaign.brandLogoUrl}
                                alt="Brand Logo"
                                className="w-20 h-20 object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <span className="text-4xl text-white">🎁</span>
                            </div>
                        )}
                        <div style={{ display: 'none' }} className="w-full h-full bg-gradient-to-br from-primary to-secondary items-center justify-center">
                            <span className="text-4xl text-white">🎁</span>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                        {campaign?.name}
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm md:text-base">Spin to Win Exclusive Prizes! 🎉</p>
                </header>

                {/* Content */}
                <main className="flex-1 flex flex-col items-center justify-center p-4 pb-24">

                    {!phoneSubmitted ? (
                        <div className="w-full bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                            <h2 className="text-xl font-semibold mb-4 text-center">Enter your number to start</h2>
                            <form onSubmit={handlePhoneSubmit}>
                                <div className="relative mb-4">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={10}
                                        placeholder="10-digit Phone Number"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        autoComplete="tel"
                                    />
                                </div>
                                {error && <div className="text-red-400 text-sm mb-4 bg-red-900/20 p-2 rounded flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
                                <button
                                    type="submit"
                                    disabled={!isPhoneValid}
                                    className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold shadow-lg hover:shadow-primary/25 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center gap-8">
                            {/* Wheel */}
                            <div className="w-full">
                                <WheelComponent
                                    offers={campaign.offers}
                                    isSpinning={spinning}
                                    winningOfferIndex={winningIndex}
                                    onSpinFinish={handleSpinFinish}
                                />
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer / CTA Actions */}
                {phoneSubmitted && (
                    <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent z-20">
                        <div className="max-w-md mx-auto">
                            {error && <div className="text-red-400 text-center text-sm mb-4 bg-red-900/30 p-3 rounded-lg backdrop-blur-sm">{error}</div>}
                            <button
                                onClick={spin}
                                disabled={spinning}
                                className="w-full py-4 text-xl font-bold bg-gradient-to-r from-primary to-secondary rounded-full shadow-2xl shadow-purple-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/50 relative overflow-hidden"
                            >
                                <span className="relative z-10">{spinning ? 'Spinning...' : 'SPIN NOW'}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ResultModal isOpen={!!result} result={result} onClose={resetGame} />
        </div>
    );
};

export default SpinPage;
