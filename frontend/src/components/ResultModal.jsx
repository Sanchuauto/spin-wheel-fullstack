import React from 'react';
import { X, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResultModal = ({ isOpen, result, onClose }) => {
    if (!isOpen || !result) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result.couponCode);
        alert('Code copied!');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 pointer-events-auto"
                    onClick={onClose}
                />

                {/* Content */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                    className="relative bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 pb-10 pointer-events-auto"
                >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300/50 rounded-full sm:hidden"></div>

                    <div className="text-center">
                        <div className="mb-4 text-5xl">🎉</div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Congratulations!
                        </h2>
                        <p className="text-gray-600 mt-2">You have won:</p>
                        <div className="text-xl font-bold text-gray-800 mt-1">{result.offerName}</div>
                        <p className="text-sm text-gray-500 mt-1">{result.offerDescription}</p>

                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                            <span className="font-mono text-xl font-bold tracking-wider text-primary">
                                {result.couponCode}
                            </span>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors font-medium text-gray-600"
                            >
                                <Copy size={20} />
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="mt-6 w-full p-3 bg-gray-900 text-white rounded-xl font-semibold active:scale-95 transition-transform"
                        >
                            Spin Again
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ResultModal;
