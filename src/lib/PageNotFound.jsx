import { useLocation } from 'react-router-dom';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-black">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-light text-gold/40">404</h1>
                        <div className="h-0.5 w-16 bg-gold/30 mx-auto"></div>
                    </div>
                    <div className="space-y-3">
                        <h2 className="font-gilda text-3xl text-white">
                            Page Not Found
                        </h2>
                        <p className="text-white/50 leading-relaxed">
                            The page <span className="text-gold">"{pageName}"</span> could not be found.
                        </p>
                    </div>
                    <div className="pt-6">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="gradient-gold text-black px-8 py-4 font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
