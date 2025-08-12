/* app/page.tsx */
import Link from "next/link";
import Image from "next/image";

export default function Home() {
    return (
        <main className="min-h-screen bg-white text-gray-900">

        
            {/* Hero with segmented search */}
            <section className="relative">
                {/* Background hero image/video area */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1600992045264-136a22de917e?q=80&w=2000&auto=format&fit=crop"
                        // src="https://images.unsplash.com/photo-1600992045264-136a22de917e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="City skyline"
                        fill
                        priority
                        className="object-cover h-[90%] w-[100vw]"
                    // height={300}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                            Discover new projects and verified listings
                        </h1>
                        <p className="mt-3 text-white/90 text-base sm:text-lg">
                            Explore builder floors, apartments, and villas across top micro-markets.
                        </p>
                    </div>

                    {/* Search Card */}
                    <div className="mt-6 bg-white rounded-xl shadow-xl border border-gray-100">
                        {/* Tabs */}
                        <div className="flex">
                            {/* {[
                                { key: "buy", label: "Buy" },
                                { key: "rent", label: "Rent" },
                                { key: "new", label: "New Projects" },
                            ].map((t, i) => (
                                <button
                                    key={t.key}
                                    data-tab={t.key}
                                    className={`w-1/3 py-3 text-sm font-medium border-b-2 ${i === 0
                                        ? "border-indigo-600 text-indigo-700"
                                        : "border-transparent text-gray-600 hover:text-gray-900"
                                        }`}
                                // For demo: first tab active by default. Hook into state if making interactive.
                                >
                                    {t.label}
                                </button>
                            ))} */}
                        </div>

                        {/* Search row */}
                        <form
                            action="/search"
                            className="p-4 sm:p-5 flex flex-col md:flex-row gap-3"
                        >
                            {/* Hidden active tab field (default buy); toggle with state when implementing */}
                            <input type="hidden" name="tab" value="buy" />

                            {/* Location/Project */}
                            <div className="flex-1">
                                <label htmlFor="q" className="sr-only">Search by city, locality or project</label>
                                <div className="relative">
                                    <input
                                        id="q"
                                        name="q"
                                        type="text"
                                        placeholder="City, locality, project, landmark"
                                        className="w-full h-12 px-4 pr-10 rounded-md border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        ⌕
                                    </span>
                                </div>
                            </div>

                            {/* Property Type */}
                            <div className="md:w-48">
                                <label htmlFor="type" className="sr-only">Property Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    className="w-full h-12 px-3 rounded-md border border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Property type</option>
                                    <option>Apartments</option>
                                    <option>Villa</option>
                                    <option>Plot</option>
                                    <option>Office</option>
                                    <option>Retail</option>
                                </select>
                            </div>

                            {/* Budget */}
                            <div className="md:w-64 flex gap-2">
                                <label htmlFor="min" className="sr-only">Min budget</label>
                                <select
                                    id="min"
                                    name="min"
                                    className="w-1/2 h-12 px-3 rounded-md border border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Min</option>
                                    <option value="1000000">₹10L</option>
                                    <option value="2500000">₹25L</option>
                                    <option value="5000000">₹50L</option>
                                    <option value="10000000">₹1Cr</option>
                                </select>

                                <label htmlFor="max" className="sr-only">Max budget</label>
                                <select
                                    id="max"
                                    name="max"
                                    className="w-1/2 h-12 px-3 rounded-md border border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Max</option>
                                    <option value="2500000">₹25L</option>
                                    <option value="5000000">₹50L</option>
                                    <option value="10000000">₹1Cr</option>
                                    <option value="20000000">₹2Cr</option>
                                    <option value="50000000">₹5Cr</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="h-12 px-6 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                            >
                                Search
                            </button>
                        </form>

                        {/* Quick filters row */}
                        <div className="px-4 sm:px-5 pb-4 flex flex-wrap gap-2 text-sm">
                            {["Near Metro", "Ready to Move", "Under Construction", "With Floor Plan", "Verified", "Owner"].map(
                                (chip) => (
                                    <Link
                                        key={chip}
                                        href={`/search?tab=buy&q=${encodeURIComponent(chip)}`}
                                        className="px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300"
                                    >
                                        {chip}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>

                    {/* Popular cities */}
                    <div className="mt-6">
                        <div className="text-white/90 text-sm mb-2">Popular cities</div>
                        <div className="flex flex-wrap gap-2">
                            {["Mumbai", "Delhi NCR", "Bengaluru", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"].map(
                                (city) => (
                                    <Link
                                        key={city}
                                        href={`/search?tab=buy&q=${encodeURIComponent(city)}`}
                                        className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-gray-900 text-sm"
                                    >
                                        {city}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Builder spotlight */}
            <section className="py-10 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-xl font-semibold">Featured Builder Projects</h2>
                        <Link href="/search?tab=new" className="text-indigo-600 text-sm hover:underline">
                            View all
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: "Skyline Residences",
                                location: "Wakad, Pune",
                                price: "₹62L–₹1.1Cr",
                                tag: "New Launch",
                                img: "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop",
                            },
                            {
                                title: "Green Arcadia",
                                location: "Whitefield, Bengaluru",
                                price: "₹80L–₹1.6Cr",
                                tag: "RERA Approved",
                                img: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
                            },
                            {
                                title: "Marine Vista",
                                location: "Andheri (W), Mumbai",
                                price: "₹1.2Cr–₹3.4Cr",
                                tag: "Possession Soon",
                                img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1600&auto=format&fit=crop",
                            },
                        ].map((p) => (
                            <Link
                                key={p.title}
                                href={`/property/${encodeURIComponent(p.title.toLowerCase().replace(/\s+/g, "-"))}`}
                                className="group overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                            >
                                <div className="relative h-48">
                                    <img
                                        src={p.img}
                                        alt={p.title}
                                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                                    />
                                    <div className="absolute left-3 top-3">
                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-white/90">
                                            {p.tag}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-base font-semibold">{p.title}</h3>
                                    <p className="text-sm text-gray-600">{p.location}</p>
                                    <p className="mt-2 text-sm font-medium">{p.price}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="inline-flex items-center px-2 py-1 text-[11px] rounded bg-green-50 text-green-700">
                                            Verified
                                        </span>
                                        <span className="inline-flex items-center px-2 py-1 text-[11px] rounded bg-indigo-50 text-indigo-700">
                                            Builder
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Neighborhood chips */}
            <section className="py-8 bg-gray-50 border-y border-gray-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-lg font-semibold">Explore by locality</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {[
                            "Baner, Pune",
                            "Whitefield, Bengaluru",
                            "Andheri, Mumbai",
                            "Gachibowli, Hyderabad",
                            "Noida Sector 150",
                            "Velachery, Chennai",
                        ].map((loc) => (
                            <Link
                                key={loc}
                                href={`/search?tab=buy&q=${encodeURIComponent(loc)}`}
                                className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-gray-300 text-sm"
                            >
                                {loc}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lead-gen band */}
            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-semibold">Get priority access to builder offers</h3>
                            <p className="text-white/90 mt-1 text-sm">
                                Book site visits, get floor plans, and receive exclusive launch pricing.
                            </p>
                        </div>
                        <form
                            action="/lead"
                            className="flex w-full md:w-auto gap-2"
                        >
                            <label htmlFor="phone" className="sr-only">Phone</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="Enter phone number"
                                className="h-12 w-full md:w-72 px-4 rounded-md border border-white/30 bg-white/10 placeholder-white/70 text-white focus:bg-white focus:text-gray-900 focus:border-white outline-none"
                            />
                            <button
                                type="submit"
                                className="h-12 px-5 rounded-md bg-white text-indigo-700 font-medium hover:bg-white/90"
                            >
                                Get Callback
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 bg-indigo-600 rounded-md" />
                                <span className="font-semibold">RealtyHub</span>
                            </div>
                            <p className="mt-3 text-gray-600">
                                New projects, verified listings, and trusted agents across India.
                            </p>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">Company</div>
                            <ul className="space-y-1 text-gray-600">
                                <li><Link href="/about" className="hover:text-indigo-600">About</Link></li>
                                <li><Link href="/careers" className="hover:text-indigo-600">Careers</Link></li>
                                <li><Link href="/contact" className="hover:text-indigo-600">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">Explore</div>
                            <ul className="space-y-1 text-gray-600">
                                <li><Link href="/search?tab=new" className="hover:text-indigo-600">New Projects</Link></li>
                                <li><Link href="/search?tab=buy" className="hover:text-indigo-600">Buy</Link></li>
                                <li><Link href="/search?tab=rent" className="hover:text-indigo-600">Rent</Link></li>
                            </ul>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">Legal</div>
                            <ul className="space-y-1 text-gray-600">
                                <li><Link href="/terms" className="hover:text-indigo-600">Terms</Link></li>
                                <li><Link href="/privacy" className="hover:text-indigo-600">Privacy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 text-gray-500">© {new Date().getFullYear()} RealtyHub Pvt Ltd</div>
                </div>
            </footer>
        </main>
    );
}
