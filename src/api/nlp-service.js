import { api } from "./api-client";

export const nlpService = {
  /**
   * Perform spellcheck on text
   */
  async spellcheck(text, signal) {
    return api("/spellcheck", { text }, { signal });
  },

  /**
   * Get next-sentence predictions
   */
  async predict(text, role, count = 5) {
    return api("/predict", { text, role, count });
  },

  /**
   * Detect coherence between two sentences
   */
  async checkCoherence(sentenceA, sentenceB, role) {
    return api("/coherence", {
      sentence_a: sentenceA,
      sentence_b: sentenceB,
      role,
    });
  },
};
