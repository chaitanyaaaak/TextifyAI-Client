import { api, API_BASE } from "./api-client";

export const fileService = {
  /**
   * Upload a file for analysis
   */
  async uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    return api("/files/upload", formData);
  },

  /**
   * Get the status of a processing job
   */
  async getStatus(jobId) {
    return api(`/files/status/${jobId}`, null, { method: "GET" });
  },

  /**
   * Get the final analysis report
   */
  async getReport(jobId) {
    return api(`/files/report/${jobId}`, null, { method: "GET" });
  },

  /**
   * Get the download URL for the corrected file
   */
  getDownloadUrl: (jobId) => `${API_BASE}/files/download/${jobId}`,
};
