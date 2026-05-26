Fix AiSensy "Copy Code" Button API Payload
"I am getting the error buttons: Button at index 0 of type Url requires a parameter when triggering my WhatsApp OTP template via AiSensy.

Our current implementation sends the OTP in templateParams for the message body, but it fails to provide the required parameter for the 'Copy Code' button. Please help me fix the API payload construction in the apps/bookings backend:

1. Inspect the Integration Logic:

Locate the code in packages/lib/aisensy.ts (or wherever we call the AiSensy API).

We are currently sending templateParams for the body text, but we need to include the buttons array (or interactive components) required by AiSensy for templates with 'Copy Code' buttons.

2. Update the Payload:

Update the API request body to include the button parameter. Based on the documentation for templates with 'Copy Code' buttons, the payload needs to explicitly define the button component.

The structure should look something like this:

{
  "apiKey": "...",
  "campaignName": "login_code_bookings",
  "destination": "...",
  "templateParams": ["OTP_VALUE"],
  "buttons": [
    {
      "type": "quick_reply", 
      "index": 0, 
      "value": "OTP_VALUE"
    }
  ]
}

Please verify if our template uses buttons or interactive components by checking the AiSensy 'Test Campaign' cURL structure.

3. Verification:

Ensure that the OTP value is passed to both the templateParams and the buttons value field.

If our template uses index 0 for the button, make sure the payload reflects that correctly.

Add a small validation check before the API call to ensure the OTP is present and matches the number of parameters the template expects.

Technical Context:

We are using the login_code_bookings campaign.

The error indicates that the AiSensy API rejects the request if the button parameter is missing.

Please make this update robust so we don't have to hardcode button indexes if possible."

Pro-Tip for your Debugging:
While waiting for Cursor to make the change, go to your AiSensy Dashboard, open the login_code_bookings campaign, and click "Test Campaign".

Look at the "Request Body" example it provides. If the example shows an interactive object instead of a buttons array, tell Cursor: "The AiSensy test cURL shows an interactive object instead of a buttons array, please use that structure instead." This ensures the code exactly matches what their gateway expects.