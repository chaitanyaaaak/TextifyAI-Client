import { api, API_BASE } from "./api-client";

export const chatService = {
  /**
   * Send a list of messages to get a reply
   */
  async sendMessage(role, messages) {
    return api("/chat", { role, messages });
  },

  /**
   * Returns a streaming response URL for chat
   */
  getStreamUrl: () => `${API_BASE}/chat/stream`,
  
  /**
   * Returns a structured chat reply URL
   */
  getStructuredUrl: () => `${API_BASE}/chat/structured`,
};
