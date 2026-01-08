/**
 * Delays execution for a given number of milliseconds.
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches with exponential backoff for transient failures (429, 5xx).
 */
export async function fetchWithBackoff(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      const response = await fetch(url, options);

      // If successful or client error (except 429), return the response
      if (response.ok || (response.status < 500 && response.status !== 429)) {
        return response;
      }

      // Retry on 429 (Too Many Requests) or 5xx (Server Error)
      if (retries === maxRetries) {
        return response;
      }

      const delay = Math.pow(2, retries) * baseDelay;
      console.log(`Transient error (${response.status}). Retrying in ${delay}ms... (Attempt ${retries + 1}/${maxRetries})`);
      
      await sleep(delay);
      retries++;
    } catch (error) {
      if (retries === maxRetries) {
        throw error;
      }

      const delay = Math.pow(2, retries) * baseDelay;
      console.log(`Fetch error. Retrying in ${delay}ms... (Attempt ${retries + 1}/${maxRetries})`);
      
      await sleep(delay);
      retries++;
    }
  }

  throw new Error("Max retries reached");
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
