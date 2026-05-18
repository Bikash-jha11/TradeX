import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: pendingItems, error: fetchErr } = await supabase
      .from('order_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: true })
      .order('queued_at', { ascending: true })
      .limit(10);

    if (fetchErr) throw fetchErr;

    const results: { id: string; status: string; error?: string }[] = [];

    for (const item of (pendingItems ?? [])) {
      await supabase
        .from('order_queue')
        .update({ status: 'processing', processing_started_at: new Date().toISOString() })
        .eq('id', item.id);

      try {
        if (item.action === 'open_position') {
          const payload = item.payload as Record<string, unknown>;

          if (item.order_id) {
            await supabase
              .from('orders')
              .update({ status: 'filled' })
              .eq('id', item.order_id);
          }

          const marginUsed = Number(payload.margin_used ?? 0);

          if (marginUsed > 0 && item.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('balance, equity, margin, free_margin')
              .eq('id', item.user_id)
              .maybeSingle();

            if (profile) {
              await supabase.from('profiles').update({
                margin: (profile.margin ?? 0) + marginUsed,
                free_margin: (profile.free_margin ?? 0) - marginUsed,
              }).eq('id', item.user_id);
            }
          }

          await supabase
            .from('order_queue')
            .update({ status: 'completed', processed_at: new Date().toISOString() })
            .eq('id', item.id);

          results.push({ id: item.id, status: 'completed' });

        } else if (item.action === 'close_position') {
          const payload = item.payload as Record<string, unknown>;
          const pnl = Number(payload.profit_loss ?? 0);

          if (item.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('balance, equity')
              .eq('id', item.user_id)
              .maybeSingle();

            if (profile) {
              const newBalance = (profile.balance ?? 0) + pnl;
              await supabase.from('profiles').update({
                balance: newBalance,
                equity: newBalance,
              }).eq('id', item.user_id);
            }
          }

          await supabase
            .from('order_queue')
            .update({ status: 'completed', processed_at: new Date().toISOString() })
            .eq('id', item.id);

          results.push({ id: item.id, status: 'completed' });

        } else {
          await supabase
            .from('order_queue')
            .update({ status: 'completed', processed_at: new Date().toISOString() })
            .eq('id', item.id);
          results.push({ id: item.id, status: 'completed' });
        }
      } catch (processErr) {
        const errMsg = processErr instanceof Error ? processErr.message : 'Unknown error';
        const newRetryCount = (item.retry_count ?? 0) + 1;
        const newStatus = newRetryCount >= (item.max_retries ?? 3) ? 'failed' : 'pending';

        await supabase.from('order_queue').update({
          status: newStatus,
          retry_count: newRetryCount,
          error_message: errMsg,
        }).eq('id', item.id);

        results.push({ id: item.id, status: newStatus, error: errMsg });
      }
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
