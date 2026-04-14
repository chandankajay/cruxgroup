// TODO: Get your AiSensy API Key from https://app.aisensy.com → Settings → API Keys.
// Format: A string token, e.g. "eyJhbGciOiJIUzI1NiIs..."

const AISENSY_API_URL = "https://backend.aisensy.com/campaign/t1/api/v2";

interface AisensySendParams {
  phone: string;
  otp: string;
}

export async function sendWhatsAppOtp({
  phone,
  otp,
}: AisensySendParams): Promise<void> {
  const apiKey = process.env["AISENSY_API_KEY"];
  const templateName = process.env["AISENSY_TEMPLATE_NAME"];

  if (!apiKey || !templateName) return;

  await fetch(AISENSY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiKey,
      campaignName: templateName,
      destination: phone,
      userName: "Crux Group",
      templateParams: [otp],
    }),
  });
}
