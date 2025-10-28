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

    const prompt = `You are a data mapping expert. Given CSV column headers and database column options, suggest the best mapping.

CSV Headers: ${csvHeaders.join(', ')}

Database Columns (with descriptions):
- service_id: Unique service identifier or service number
- site_name: Customer name, business name, or site name
- site_street_name: Street address
- site_suburb: City or suburb
- site_post_code: Postal/ZIP code
- site_pobox: PO Box number
- site_email_address: Email address
- site_telephone_no1: Primary phone number
- site_telephone_no2: Secondary phone number
- site_fax_no: Fax number
- site_contact_first_name: Contact first name
- site_contact_lastname: Contact last name
- site_accounts_contact: Accounts contact person
- postal_address: Full postal address
- contract_date: Contract start date
- date_cancel: Cancellation date
- contract_notes: Contract notes
- notes: General notes
- delete_tag: Delete flag (boolean)

EXCLUDED COLUMNS (always map to "skip"):
- ysnPrint
- Save_tag
- SiteState
- RunTag

Return ONLY a JSON object mapping each CSV header to the best database column, or "skip" if no good match exists.
Format: {"CSV Header": "database_column_or_skip"}

CRITICAL: The fields "service_id" and "site_name" are REQUIRED. You MUST map at least these two fields to appropriate CSV columns.
CRITICAL: Any columns matching the excluded list (ysnPrint, Save_tag, SiteState, RunTag) must ALWAYS be mapped to "skip".`;

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
