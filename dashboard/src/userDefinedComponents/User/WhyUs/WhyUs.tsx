import backgroundImage from '@/assets/img/travel-moment.jpg';

const WhyUs = () => {
    return (
        <div
            className="w-full px-5 py-28 bg-cover relative overflow-hidden pattern-2 pt-20"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                zIndex: 0,
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Pattern overlay */}
            <div className="absolute inset-0 bg-black/50 showPattern mix-blend-multiply" style={{ zIndex: -1 }} />

            <div className="max-w-8xl mx-auto relative" style={{ zIndex: 20 }}>
                <h2 className="text-white text-3xl text-center mb-8">Why Book with Us?</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="ws-why-bookus-wrap wow fadeInUp">
                            <div className="ws-icon-why-bookus">
                                <img
                                    src="https://raw.githubusercontent.com/sushilldhakal/lordbuddha/master/assets/img/whybookus-1.png"
                                    alt="One Stop Book"
                                    className="mx-auto"
                                />
                            </div>
                            <div className="ws-title-why-bookus">
                                <h3 className="text-white text-lg font-bold mt-4">One Stop Book</h3>
                            </div>
                            <div className="ws-content-why-bookus">
                                <p className="text-white">
                                    Widest range of 2,700 tours and activities from all around the world to give you the best.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="ws-why-bookus-wrap wow fadeInUp">
                            <div className="ws-icon-why-bookus">
                                <img
                                    src="https://raw.githubusercontent.com/sushilldhakal/lordbuddha/master/assets/img/whybookus-2.png"
                                    alt="Verified Reviews"
                                    className="mx-auto"
                                />
                            </div>
                            <div className="ws-title-why-bookus">
                                <h3 className="text-white text-lg font-bold mt-4">Refer to Verified</h3>
                            </div>
                            <div className="ws-content-why-bookus">
                                <p className="text-white">
                                    We verify all reviews to give you the best advice from trusted other travelers.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="ws-why-bookus-wrap wow fadeInUp">
                            <div className="ws-icon-why-bookus">
                                <img
                                    src="https://raw.githubusercontent.com/sushilldhakal/lordbuddha/master/assets/img/whybookus-3.png"
                                    alt="Secret Travel Tips"
                                    className="mx-auto"
                                />
                            </div>
                            <div className="ws-title-why-bookus">
                                <h3 className="text-white text-lg font-bold mt-4">Secret Travel Tips</h3>
                            </div>
                            <div className="ws-content-why-bookus">
                                <p className="text-white">
                                    Join 50,000 other subscribers and get weekly travel tips from other travelers and locals.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="ws-why-bookus-wrap wow fadeInUp">
                            <div className="ws-icon-why-bookus">
                                <img
                                    src="https://raw.githubusercontent.com/sushilldhakal/lordbuddha/master/assets/img/whybookus-4.png"
                                    alt="Best Price Guarantee"
                                    className="mx-auto"
                                />
                            </div>
                            <div className="ws-title-why-bookus">
                                <h3 className="text-white text-lg font-bold mt-4">Best Price Guarantee</h3>
                            </div>
                            <div className="ws-content-why-bookus">
                                <p className="text-white">
                                    Our pricing is updated constantly to ensure you get the best price available online or at your destination.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyUs;
