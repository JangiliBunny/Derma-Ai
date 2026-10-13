import React, { useState } from 'react';
import { Calendar, Clock, Video, Building, ExternalLink, CheckCircle, XCircle, RefreshCw, Link as LinkIcon, VideoOff, Ban } from 'lucide-react';

const MEET_REGEX = /^https?:\/\/(meet\.google\.com\/[a-zA-Z0-9_-]+)(\?.*)?$/i;

function isValidMeetUrl(url: string) {
    if (!url) return false;
    let formatted = url.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = 'https://' + formatted;
    }
    return MEET_REGEX.test(formatted);
}

export default function AppointmentsTable({
    appointments,
    role,
    onStatusChange,
    onCancelAppointment
}: {
    appointments: any[],
    role: "patient" | "doctor",
    onStatusChange: (id: string, newStatus: string, meetUrl?: string) => Promise<void> | void,
    onCancelAppointment?: (id: string) => Promise<void> | void
}) {
    const [selectedAppForApproval, setSelectedAppForApproval] = useState<any | null>(null);
    const [meetUrlInput, setMeetUrlInput] = useState('');
    const [urlError, setUrlError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'Cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'Completed': return 'bg-slate-100 text-slate-800 border-slate-200';
            case 'Rescheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleApproveClick = (app: any) => {
        if (app.consultation_type === 'Online') {
            setSelectedAppForApproval(app);
            setMeetUrlInput(app.meet_url || '');
            setUrlError('');
        } else {
            onStatusChange(app.id, 'Approved');
        }
    };

    const handleConfirmApproval = async () => {
        let finalUrl = meetUrlInput.trim();
        if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }

        if (!isValidMeetUrl(finalUrl)) {
            setUrlError('Please enter a valid Google Meet URL (e.g. https://meet.google.com/abc-defg-hij)');
            return;
        }

        setIsSubmitting(true);
        try {
            await onStatusChange(selectedAppForApproval.id, 'Approved', finalUrl);
            setSelectedAppForApproval(null);
            setMeetUrlInput('');
            setUrlError('');
        } catch (err: any) {
            setUrlError(err.message || 'Failed to approve appointment');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (appointments.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
                <Calendar className="w-14 h-14 text-blue-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-1">No Appointments Found</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">You don't have any appointments scheduled in this view.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {role === 'doctor' ? 'Patient Details' : 'Doctor Details'}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Date & Time
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Mode & Reason
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Consultation / Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {appointments.map((app) => {
                                const isOnline = app.consultation_type === 'Online';
                                const isApproved = app.status === 'Approved';
                                const isCancelled = app.status === 'Cancelled' || app.status === 'Rejected';
                                const hasMeetUrl = !!app.meet_url;

                                return (
                                    <tr key={app.id || app._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                                    {(role === 'doctor' ? (app.patient_name || app.patient_id) : (app.doctor_name || app.doctor_id)).substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-slate-900">
                                                        {role === 'doctor' ? (app.patient_name || `Patient ${app.patient_id.substring(0, 6)}...`) : (app.doctor_name || `Dr. ${app.doctor_id.substring(0, 6)}...`)}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-0.5">Appt ID: {app.id.substring(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                                                <Calendar className="w-3.5 h-3.5 text-[#0284c7]" />
                                                {app.date}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                {app.time} {app.end_time ? `- ${app.end_time}` : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5 mb-1">
                                                {isOnline ? (
                                                    <span className="inline-flex items-center gap-1 text-[#0284c7] font-semibold bg-sky-50 px-2.5 py-0.5 rounded-md text-xs">
                                                        <Video className="w-3.5 h-3.5" /> Video Consult
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-md text-xs">
                                                        <Building className="w-3.5 h-3.5" /> Clinic Visit
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-600 truncate max-w-xs" title={app.reason}>
                                                {app.reason}
                                            </div>
                                            {app.scan_image_url && (
                                                <a href={app.scan_image_url} target="_blank" rel="noreferrer" className="text-xs text-[#0284c7] hover:underline flex items-center gap-1 mt-1">
                                                    Attached AI Scan <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusStyle(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Join Consultation Button if Approved and Meet URL exists */}
                                                {isApproved && isOnline && hasMeetUrl && (
                                                    <a
                                                        href={app.meet_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all hover:scale-105 active:scale-95"
                                                    >
                                                        <Video className="w-3.5 h-3.5" />
                                                        Join Consultation
                                                    </a>
                                                )}

                                                {/* Doctor Actions */}
                                                {role === 'doctor' && (
                                                    <>
                                                        {app.status === 'Pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApproveClick(app)}
                                                                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 flex items-center gap-1"
                                                                    title="Approve Appointment"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => onStatusChange(app.id, 'Rejected')}
                                                                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 flex items-center gap-1"
                                                                    title="Reject Appointment"
                                                                >
                                                                    <XCircle className="w-4 h-4" /> Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        {isApproved && (
                                                            <>
                                                                {isOnline && (
                                                                    <button
                                                                        onClick={() => handleApproveClick(app)}
                                                                        className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-[#0284c7] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 flex items-center gap-1"
                                                                        title="Update Google Meet URL"
                                                                    >
                                                                        <LinkIcon className="w-3.5 h-3.5" /> Edit Link
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => onStatusChange(app.id, 'Completed')}
                                                                    className="px-2.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-200 flex items-center gap-1"
                                                                    title="Mark Consultation as Completed"
                                                                >
                                                                    <CheckCircle className="w-3.5 h-3.5" /> Complete
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}

                                                {/* Patient or Doctor Cancel Action */}
                                                {((role === 'patient' && (app.status === 'Pending' || app.status === 'Approved')) ||
                                                  (role === 'doctor' && app.status === 'Approved')) && onCancelAppointment && (
                                                    <button
                                                        onClick={() => onCancelAppointment(app.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                                        title="Cancel Appointment"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {isCancelled && (
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <VideoOff className="w-3.5 h-3.5" /> Unavailable
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Doctor Approval Google Meet Link Entry Modal */}
            {selectedAppForApproval && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0284c7] flex items-center justify-center">
                                <Video className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Approve Video Consultation</h3>
                                <p className="text-xs text-slate-500">Provide the Google Meet link for this session</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-2xl mb-4 text-xs text-slate-600 space-y-1 border border-slate-100">
                            <div><strong className="text-slate-800">Patient:</strong> {selectedAppForApproval.patient_name || selectedAppForApproval.patient_id}</div>
                            <div><strong className="text-slate-800">Date & Time:</strong> {selectedAppForApproval.date} at {selectedAppForApproval.time}</div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <LinkIcon className="w-3.5 h-3.5 text-[#0284c7]" /> Google Meet URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://meet.google.com/abc-defg-hij"
                                value={meetUrlInput}
                                onChange={(e) => {
                                    setMeetUrlInput(e.target.value);
                                    if (urlError) setUrlError('');
                                }}
                                className={`w-full px-4 py-3 border rounded-xl outline-none text-sm transition-all ${
                                    urlError ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:ring-2 focus:ring-[#0284c7] focus:border-transparent'
                                }`}
                            />
                            {urlError && (
                                <p className="text-xs text-rose-600 mt-1.5 font-medium">{urlError}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-1.5">
                                Paste the meeting link generated from Google Meet (e.g. meet.google.com/xyz-abc-123).
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setSelectedAppForApproval(null)}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-100 text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmApproval}
                                disabled={isSubmitting || !meetUrlInput.trim()}
                                className="flex-1 py-3 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    "Confirm & Approve"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

