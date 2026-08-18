const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const systemPrompt = `
You are Cohort Buddy, a concise and friendly assistant for the Cohort PCCOE website.
Help visitors understand the platform, PCCOE community features, login, demo mode,
communities, XD board, campus map, calendar, profile, arcade, and student networking.
Do not ask for passwords, private keys, OTPs, or confidential account details.
If the user needs official college, legal, medical, or emergency information, tell them
to verify with the official PCCOE administration or relevant authority.
`;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return Response.json(
      { error: 'Chatbot is not configured yet. Add OPENAI_API_KEY to Supabase Edge Function secrets.' },
      { status: 500, headers: corsHeaders },
    );
  }

  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const cleanMessages = messages
      .filter((message) => ['user', 'assistant'].includes(message?.role) && typeof message?.content === 'string')
      .slice(-8)
      .map((message) => ({
        role: message.role,
        content: message.content.slice(0, 1200),
      }));

    if (!cleanMessages.length) {
      return Response.json({ error: 'Message is required.' }, { status: 400, headers: corsHeaders });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-5-mini',
        instructions: systemPrompt,
        input: cleanMessages,
        max_output_tokens: 450,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: data?.error?.message ?? 'Chatbot request failed.' },
        { status: response.status, headers: corsHeaders },
      );
    }

    const reply =
      data.output_text ??
      data.output
        ?.flatMap((item) => item.content ?? [])
        ?.map((content) => content.text)
        ?.filter(Boolean)
        ?.join('\n')
        ?.trim();

    return Response.json({ reply: reply || 'I could not generate a reply just now.' }, { headers: corsHeaders });
  } catch (_error) {
    return Response.json({ error: 'Chatbot request failed.' }, { status: 500, headers: corsHeaders });
  }
});
