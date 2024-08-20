const Filter = () => {
    return (
        <div className="clearfix flex justify-between items-center py-4">
            <div className="flex space-x-4">
                <div className="flex flex-col space-y-2">
                    <h4 className="text-lg font-semibold">Filter By</h4>
                    <button className="btn inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Filter By <i className="fas fa-chevron-down ml-2"></i>
                    </button>
                </div>

                <input type="hidden" id="wp-travel-archive-url" value="https://wpdemo.wensolutions.com/travel-joy-pro/itinerary/" />

                <div className="flex space-x-4">
                    <div className="flex flex-col">
                        <label htmlFor="price" className="text-sm font-medium">Price</label>
                        <select name="price" className="border border-gray-300 rounded p-2">
                            <option value="">Price</option>
                            <option value="low_high" data-type="meta">Price low to high</option>
                            <option value="high_low" data-type="meta">Price high to low</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="itinerary_types" className="text-sm font-medium">Trip Type</label>
                        <select name="itinerary_types" id="itinerary_types" className="border border-gray-300 rounded p-2">
                            <option value="">Trip Type</option>
                            <option value="historical-monuments">Historical Monuments</option>
                            <option value="vacation">Vacation</option>
                            <option value="luxury-life">Luxury Life</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="travel_locations" className="text-sm font-medium">Location</label>
                        <select name="travel_locations" id="travel_locations" className="border border-gray-300 rounded p-2">
                            <option value="">Location</option>
                            <option value="america">America</option>
                            <option value="asia">Asia</option>
                            <option value="mexico">Mexico</option>
                            <option value="europe">Europe</option>
                            <option value="germany">Germany</option>
                            <option value="japan">Japan</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="trip_date" className="text-sm font-medium">Trip Date</label>
                        <select name="trip_date" className="border border-gray-300 rounded p-2">
                            <option value="">Trip Date</option>
                            <option value="asc" data-type="meta">Ascending</option>
                            <option value="desc" data-type="meta">Descending</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="trip_name" className="text-sm font-medium">Trip Name</label>
                        <select name="trip_name" className="border border-gray-300 rounded p-2">
                            <option value="">Trip Name</option>
                            <option value="asc" data-type="meta">Ascending</option>
                            <option value="desc" data-type="meta">Descending</option>
                        </select>
                    </div>
                </div>

                <input type="hidden" name="_nonce" value="47e6d4c391" />

                <div>
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Show</button>
                </div>
            </div>

            <div>
                <ul className="flex space-x-2">
                    <li className="cursor-pointer" data-mode="grid">
                        <a href="javascript:void(0)" className="text-gray-500 hover:text-gray-800">
                            <i className="dashicons dashicons-grid-view"></i>
                        </a>
                    </li>
                    <li className="cursor-pointer active-mode" data-mode="list">
                        <a href="javascript:void(0)" className="text-gray-500 hover:text-gray-800">
                            <i className="dashicons dashicons-list-view"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Filter;
