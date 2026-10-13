import React from 'react';
import { Droplet, AlertTriangle, ShieldAlert, BrainCircuit } from 'lucide-react';

export default function HealthMetricsCards({ profile, lastScanConfidence }: { profile: any, lastScanConfidence?: number }) {
    if (!profile) return null;

    const cards = [
        {
            title: "Skin Hydration",
            value: profile.skin_hydration || "Normal",
            icon: Droplet,
            color: "text-blue-500",
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        {
            title: "Sensitivity Score",
            value: "Medium", // This could also come from profile
            icon: AlertTriangle,
            color: "text-orange-500",
            bg: "bg-orange-50",
            border: "border-orange-100"
        },
        {
            title: "Allergy Risk",
            value: profile.allergy_risk || "Low",
            icon: ShieldAlert,
            color: "text-green-500",
            bg: "bg-green-50",
            border: "border-green-100"
        },
        {
            title: "AI Detection Confidence",
            value: lastScanConfidence ? `${lastScanConfidence}%` : "N/A",
            icon: BrainCircuit,
            color: "text-purple-500",
            bg: "bg-purple-50",
            border: "border-purple-100"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div key={idx} className={`rounded-2xl p-4 border ${card.border} flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-xl ${card.bg}`}>
                                <Icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1 line-clamp-1" title={card.title}>{card.title}</p>
                            <h3 className="text-lg font-bold text-slate-800">{card.value}</h3>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
