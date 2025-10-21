const fetch = require('node-fetch'); // Use the CommonJS version of node-fetch

exports.handler = async function(event, context) {
  const AIRTABLE_API_URL = "https://api.airtable.com/v0/appjPgePDpZx1YFDK/tbloS2feAtDFqo6Mq";
  const AIRTABLE_API_KEY = process.env.api; // Replace with your actual API key

  console.log('Received event:', event); // Log the incoming event data

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      console.log('Parsed data:', data); // Log parsed webhook data

      const email = data.payload?.auth?.email || null;
      const firstName = data.payload?.customFields?.['first-name'] || null;
      const lastName = data.payload?.customFields?.['last-name'] || null;
      const companyName = data.payload?.customFields?.["company-name"] || null;
      const companyId = data.payload?.customFields?.["pin-number"] || null; // Use optional chaining to handle missing fields
      const id = data.payload?.id || null;
      const uer = data.payload?.customFields?.['user'] || null;

      // Determine UserType based on the presence of companyId
      const userType = companyId ? "Member" : "Non-Member";

      const validUserOptions = ["Associate", "Affiliate", "Builder"]; // Match Airtable options
      const validUer = validUserOptions.includes(uer) ? uer : null; // Only accept valid options

      const airtableData = {
        fields: {
          "First Name": firstName,
          "Last Name": lastName,
          "Email Address": email,
          "Member ID": id,
          "Company Name": companyName,
          "Company ID Used": companyId,
          "UserType": userType ,
          "User": validUer,// Add UserType to Airtable data
          "Membership Status": companyId ? "Member" : "Non-member"
        }
      };

      console.log('Sending data to Airtable:', airtableData); // Log data being sent to Airtable

      const response = await fetch(AIRTABLE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(airtableData)
      });

      if (response.ok) {
        console.log('Data successfully sent to Airtable');
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Data successfully sent to Airtable.' })
        };
      } else {
        const errorData = await response.json();
        console.error('Error response from Airtable:', errorData); // Log Airtable error response
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Error sending data to Airtable.', error: errorData })
        };
      }
    } catch (error) {
      console.error('Error handling the request:', error); // Log any other errors
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error handling the request.', error: error.message })
      };
    }
  } else {
    console.log('Method not allowed:', event.httpMethod); // Log if the method is not POST
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }
};
