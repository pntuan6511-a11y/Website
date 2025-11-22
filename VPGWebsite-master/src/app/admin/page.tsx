"use client";
import { EcommerceMetrics } from "@/components/admin/dashboard/EcommerceMetrics";
import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    cars: 0,
    testDrives: 0,
    priceQuotes: 0,
    customers: 0
  });

  useEffect(() => {
    fetch('/api/admin/summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
        <EcommerceMetrics summary={summary} />

        {/* You can add more widgets here later, e.g. charts */}
        {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-2">
           <MonthlySalesChart />
           <MonthlyTarget />
        </div> */}
      </div>
    </div>
  );
}
