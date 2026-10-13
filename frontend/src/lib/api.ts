/**
 * DermaAI - Central API & Asset Configuration
 *
 * Provides normalized backend URL construction for Client and Server components.
 * Configured via process.env.NEXT_PUBLIC_API_URL.
 */

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Normalize base URL by removing any trailing slashes
export const API_BASE_URL: string = rawApiUrl.replace(/\/+$/, "");

/**
 * Returns a fully qualified API endpoint URL.
 * Automatically normalizes leading slashes on the endpoint path.
 *
 * @param path - API path (e.g. "/api/auth/token" or "api/doctors")
 * @returns Fully qualified URL (e.g. "http://localhost:8000/api/auth/token")
 */
export function getApiUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Returns a fully qualified URL for uploaded patient images or static media.
 * Handles Windows backslashes stored in database records safely.
 *
 * @param relativeOrAbsoluteUrl - Relative path (e.g. "uploads/uuid_scan.jpg") or absolute URL
 * @returns Fully qualified HTTP(S) URL
 */
export function getImageUrl(relativeOrAbsoluteUrl: string | null | undefined): string {
    if (!relativeOrAbsoluteUrl) {
        return "";
    }
    // If already fully qualified (e.g. external avatar)
    if (relativeOrAbsoluteUrl.startsWith("http://") || relativeOrAbsoluteUrl.startsWith("https://")) {
        return relativeOrAbsoluteUrl;
    }
    // Convert any Windows backslashes to standard URL forward slashes
    const normalized = relativeOrAbsoluteUrl.replace(/\\/g, "/");
    const cleanPath = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Returns the download URL for a generated PDF medical report.
 *
 * @param scanId - Scan identifier
 * @returns Fully qualified report download endpoint URL
 */
export function getReportDownloadUrl(scanId: string | null | undefined): string {
    if (!scanId) {
        return "";
    }
    return getApiUrl(`/api/predictions/${encodeURIComponent(scanId)}/download`);
}
