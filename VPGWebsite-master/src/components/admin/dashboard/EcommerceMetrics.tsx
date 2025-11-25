"use client";
import React from "react";
import { BoxIcon, TaskIcon, DollarLineIcon, GroupIcon } from "../icons";
import SimpleBarChart from "./SimpleBarChart";

interface EcommerceMetricsProps {
    summary: {
        cars: number;
        testDrives: number;
        priceQuotes: number;
        customers: number;
    };
}

export const EcommerceMetrics: React.FC<EcommerceMetricsProps> = ({ summary }) => {
    const topCars = [
        { name: "Xe A", value: summary.testDrives + summary.priceQuotes },
        { name: "Xe B", value: Math.round(summary.testDrives * 0.8 + summary.priceQuotes * 1.2) },
        { name: "Xe C", value: Math.round(summary.testDrives * 1.1 + summary.priceQuotes * 0.9) },
    ];

    return (
        <section className="p-2 bg-gray-50 rounded-xl space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thống kê tổng quan</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                {/* Cars */}
                <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center space-x-3">
                        <BoxIcon className="size-6" />
                        <div>
                            <p className="text-sm">Tổng số xe</p>
                            <p className="text-2xl font-bold">{summary.cars}</p>
                        </div>
                    </div>
                </div>
                {/* Test Drives */}
                <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center space-x-3">
                        <TaskIcon className="size-6" />
                        <div>
                            <p className="text-sm">Lái thử</p>
                            <p className="text-2xl font-bold">{summary.testDrives}</p>
                        </div>
                    </div>
                </div>
                {/* Price Quotes */}
                <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center space-x-3">
                        <DollarLineIcon className="size-6" />
                        <div>
                            <p className="text-sm">Báo giá</p>
                            <p className="text-2xl font-bold">{summary.priceQuotes}</p>
                        </div>
                    </div>
                </div>
                {/* Customers */}
                <div className="rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center space-x-3">
                        <GroupIcon className="size-6" />
                        <div>
                            <p className="text-sm">Khách hàng</p>
                            <p className="text-2xl font-bold">{summary.customers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Xe có nhu cầu báo giá & lái thử cao nhất</h3>
                <SimpleBarChart data={topCars} />
            </div> */}
        </section>
    );
};
