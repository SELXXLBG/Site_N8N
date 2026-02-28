$json = Get-Content "Tally → Audit PDF → Email + Telegram.json" -Raw -Encoding UTF8

function Escape-Json($s) {
  $s = $s -replace '\\', '\\'
  $s = $s -replace '"', '\"'
  $s = $s -replace "`r`n", '\n'
  $s = $s -replace "`n", '\n'
  $s = $s -replace "`r", '\n'
  $s = $s -replace "`t", '\t'
  return $s
}

# ── Code correct pour "Déjà soumis ?" (ID: a91495c2)
$alreadyCode = @'
const rows = $input.all().map(i => i.json).filter(r => r && r.email && String(r.email).includes('@'));
const lead = $('Extraire données Tally').first().json;
const alreadyDone = rows.length > 0;
return [{ json: { ...lead, alreadyDone } }];
'@

# ── Code correct pour "Préparer HTML Rapport" (ID: bfa2531b)
$htmlCode = @'
let aiContent = '';
try {
  aiContent = $input.first().json.choices[0].message.content || '';
  aiContent = aiContent.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();
} catch(e) {
  aiContent = '<p>Contenu indisponible — contactez Nexus directement.</p>';
}

const client = $('Extraire données Tally').first().json;
const isFR = client.langue !== 'en';

const html = `<!DOCTYPE html><html lang="${client.langue}"><head><meta charset="UTF-8"><title>Audit Nexus — ${client.nom}</title><style>body{font-family:Arial,sans-serif;background:#0a0f1e;color:#f1f5f9;margin:0;padding:40px}h1{color:#10b981;font-size:2rem;margin-bottom:8px}h2{color:#10b981;font-size:1.3rem;margin-top:32px;border-bottom:1px solid rgba(16,185,129,0.3);padding-bottom:8px}h3{color:#34d399;font-size:1.1rem;margin-top:20px}p,li{color:#94a3b8;line-height:1.7;font-size:0.95rem}.header{background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:24px;margin-bottom:32px}.meta span{display:inline-block;background:rgba(255,255,255,0.05);border-radius:6px;padding:4px 12px;margin:4px;font-size:0.85rem;color:#94a3b8}.footer{margin-top:48px;text-align:center;color:#475569;font-size:0.8rem;border-top:1px solid rgba(255,255,255,0.06);padding-top:24px}</style></head><body><div class="header"><h1>⚡ ${isFR ? 'Audit Automatisation Nexus' : 'Nexus Automation Audit'}</h1><p style="color:#10b981;margin:0">${isFR ? 'Rapport personnalisé pour' : 'Personalised report for'} <strong>${client.nom}</strong></p><div class="meta" style="margin-top:16px"><span>🌐 ${client.site}</span><span>🛒 ${client.plateforme}</span><span>💰 ${client.ca}</span></div></div>${aiContent}<div class="footer">© ${new Date().getFullYear()} Nexus — nexus-auto.fr</div></body></html>`;

return [{ json: { ...client, html } }];
'@

$alreadyEscaped = Escape-Json $alreadyCode
$htmlEscaped    = Escape-Json $htmlCode

# Patch par ID exact
# Nœud "Déjà soumis ?" — ID: a91495c2-0c2d-484d-938a-120916e88999
$json = [regex]::Replace($json,
  '("a91495c2-0c2d-484d-938a-120916e88999"[\s\S]{1,600}?"jsCode":\s*)"(?:[^"\\]|\\.)*"',
  { param($m) $m.Groups[1].Value + '"' + $alreadyEscaped + '"' }
)

# Nœud "Préparer HTML Rapport" — ID: bfa2531b-0dc7-485c-8328-b74dbcec2cc3
$json = [regex]::Replace($json,
  '("bfa2531b-0dc7-485c-8328-b74dbcec2cc3"[\s\S]{1,600}?"jsCode":\s*)"(?:[^"\\]|\\.)*"',
  { param($m) $m.Groups[1].Value + '"' + $htmlEscaped + '"' }
)

Set-Content "Tally → Audit PDF → Email + Telegram.json" -Value $json -Encoding UTF8

try {
  $check = Get-Content "Tally → Audit PDF → Email + Telegram.json" -Raw | ConvertFrom-Json -Depth 30
  Write-Host "✅ JSON valide — $($check.nodes.Count) nœuds"
  $check.nodes | ForEach-Object {
    if ($_.parameters.jsCode) {
      Write-Host "  $($_.name): $($_.parameters.jsCode.Substring(0, [Math]::Min(60, $_.parameters.jsCode.Length)))"
    }
  }
} catch { Write-Host "❌ JSON invalide: $_" }
