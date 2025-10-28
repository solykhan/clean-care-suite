import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvHeaders, databaseColumns } = await req.json();
    
    if (!csvHeaders || !databaseColumns) {
      throw new Error('Missing required parameters');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build field descriptions
    const fieldDescriptions: Record<string, string> = {
      // Customer fields
      service_id: "Unique service identifier or service number",
      site_name: "Customer name, business name, or site name",
      site_street_name: "Street address",
      site_suburb: "City or suburb",
      site_post_code: "Postal/ZIP code",
      site_pobox: "PO Box number",
      site_email_address: "Email address",
      site_telephone_no1: "Primary phone number",
      site_telephone_no2: "Secondary phone number",
      site_fax_no: "Fax number",
      site_contact_first_name: "Contact first name",
      site_contact_lastname: "Contact last name",
      site_accounts_contact: "Accounts contact person",
      postal_address: "Full postal address",
      contract_date: "Contract start date",
      date_cancel: "Cancellation date",
      contract_notes: "Contract notes",
      notes: "General notes",
      delete_tag: "Delete flag (boolean)",
      // Service agreement fields
      products: "Products or services provided",
      areas_covered: "Areas or locations covered by the service",
      service_frequency: "How often the service is performed (daily, weekly, monthly, etc.)",
      service_active_inactive: "Current status of the service (Active or Inactive)",
      invoice_type: "Type of invoice or billing method",
      cpm_device_onsite: "CPM (Cost Per Month) device information or onsite equipment",
      unit_price: "Price per unit of service",
      cpm_pricing: "Cost per month pricing",
      cpi: "Consumer Price Index adjustment or pricing index",
      total: "Total cost or price",
      comments: "Additional comments or notes"
    };

    const excludedColumns = ["ysnPrint", "Save_tag", "SiteState", "RunTag"];
    
    const dbColumnsList = databaseColumns
      .filter((col: string) => col !== "skip")
      .map((col: string) => `- ${col}: ${fieldDescriptions[col] || "No description"}`)
      .join('\n');

    const prompt = `You are a data mapping expert. Map CSV column headers to database columns based on semantic similarity.

CSV Headers to map: ${csvHeaders.join(', ')}

Available Database Columns:
${dbColumnsList}

RULES:
1. Match columns based on meaning, not just exact text match
2. Handle variations like "ServiceID" → "service_id", "PRODUCTS" → "products"
3. Handle spaces and underscores: "AREAS COVERED" → "areas_covered"
4. If a CSV header matches these excluded terms, ALWAYS map to "skip": ${excludedColumns.join(', ')}
5. If no good semantic match exists, map to "skip"

Return ONLY a JSON object mapping each CSV header to its best database column match.
Format: {"CSV_Header": "database_column_or_skip"}

Example: {"ServiceID": "service_id", "PRODUCTS": "products", "AREAS COVERED": "areas_covered"}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a data mapping expert. Always return valid JSON only, no additional text.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status, await response.text());
      throw new Error('Failed to get AI mapping suggestions');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response from AI
    let mapping;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mapping = JSON.parse(jsonMatch[0]);
      } else {
        mapping = JSON.parse(aiResponse);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid AI response format');
    }

    return new Response(
      JSON.stringify({ mapping }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-map-columns:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
