import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center cursor-pointer">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                                Brand
                            </span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
                            <a href="#about" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
                        </div>
                        <div>
                            <Link
                                href="/admin"
                                className="px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Go to Admin
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-semibold tracking-wide uppercase">
                        New Release v2.0
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Faster</span>, <br />
                        Scale <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Better</span>.
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
                        A premium foundation for your next big project. Modern, fast, and ready to deploy. Experience the future of web development today.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/admin" className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2">
                            Get Started
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                        <button className="px-8 py-4 rounded-full border border-gray-300 dark:border-gray-700 font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-gray-700 dark:text-gray-200">
                            Learn More
                        </button>
                    </div>
                </div>

                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none opacity-60 dark:opacity-40">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
                    <div className="absolute top-20 right-10 w-96 h-96 bg-violet-400/30 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold mb-6">Why Choose Us?</h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
                            We provide the tools you need to build world-class applications with ease and precision.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "High Performance",
                                desc: "Optimized for speed and efficiency. Your users will love the snappy experience.",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                )
                            },
                            {
                                title: "Modern Design",
                                desc: "Beautifully crafted UI components that look great on any device.",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                                )
                            },
                            {
                                title: "Secure by Default",
                                desc: "Enterprise-grade security built-in to protect your data and your users.",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                )
                            },
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
                                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Brand</span>
                    </div>
                    <div className="flex space-x-6 mb-4 md:mb-0">
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
                    </div>
                    <p>© 2024 Brand. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
