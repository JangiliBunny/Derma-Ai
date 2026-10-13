'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function AITimelineChart({ scans }: { scans: any[] }) {

    // In a real application, we would aggregate the actual scan history dates.
    // For demo purposes mirroring the mockup, we will show a progression trend.
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: {
                    color: '#f1f5f9',
                    drawBorder: false,
                },
                ticks: {
                    callback: function (value: any) {
                        return value + '%';
                    }
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                }
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    };

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Disease Severity Prediction',
                data: [85, 92, 78, 55, 30, 15],
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0284c7',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">AI Skin Scan Timeline</h2>
                <span className="text-sm text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                    Improving Trend
                </span>
            </div>
            <div className="p-6">
                <p className="text-sm text-gray-500 mb-4">Tracking Disease Severity & Recovery Progression Over Time</p>
                <div className="h-64 w-full">
                    <Line options={options} data={data} />
                </div>
            </div>
        </div>
    );
}
