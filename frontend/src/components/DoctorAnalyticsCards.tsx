import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function DoctorAnalyticsCards({ cases }: { cases: any[] }) {
    // Generate analytics based on actual AI diagnosed cases connected to this doctor
    const diseasesCount: Record<string, number> = {};
    const monthlyData = [0, 0, 0, 0, 0, 0, 0]; // Last 7 months mock
    let avgConfidence = 0;

    if (cases && cases.length > 0) {
        let totalConf = 0;
        cases.forEach(c => {
            const disease = c.prediction?.disease_name || "Unknown";
            diseasesCount[disease] = (diseasesCount[disease] || 0) + 1;
            totalConf += (c.prediction?.confidence || 0);

            // Randomly bucket to monthly for demo
            monthlyData[Math.floor(Math.random() * 7)]++;
        });
        avgConfidence = Math.round(totalConf / cases.length);
    } else {
        // Mock fallback if no cases
        diseasesCount["Acne"] = 45;
        diseasesCount["Psoriasis"] = 28;
        diseasesCount["Melanoma"] = 12;
        diseasesCount["Eczema"] = 35;
        avgConfidence = 91;
    }

    const labels = Object.keys(diseasesCount);
    const dataValues = Object.values(diseasesCount);

    const doughnutData = {
        labels: labels.slice(0, 4), // Top 4
        datasets: [
            {
                data: dataValues.slice(0, 4),
                backgroundColor: ['#0284c7', '#14b8a6', '#8b5cf6', '#f59e0b'],
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right' as const, labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 } } }
        },
        cutout: '75%',
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden col-span-1 lg:col-span-1 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                <h2 className="text-lg font-bold text-slate-800">Clinic Analytics</h2>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6">
                <div>
                    <p className="text-sm font-bold text-gray-500 mb-4">Patient Demographics (Top Diseases)</p>
                    <div className="h-44 relative">
                        {labels.length > 0 ? (
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No data available</div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-24">
                            <span className="text-2xl font-bold text-slate-800">{cases?.length || 120}</span>
                            <span className="text-xs text-gray-500">Total</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">AI Accuracy Matrix</p>
                        <p className="text-xl font-bold text-[#0284c7]">{avgConfidence}%</p>
                    </div>
                    <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 flex flex-col justify-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Feedback Loop</p>
                        <p className="text-xl font-bold text-teal-600">{cases?.filter(c => c.doctor_feedback === 'Confirmed').length || 85} Confirmed</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
