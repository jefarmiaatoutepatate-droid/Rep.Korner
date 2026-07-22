import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS } from '@/constants/theme';
import { Card, SectionTitle, Button } from '@/components/ui';
import { buildWeeklyReport } from '@/lib/reportService';
import { getArchivedReports } from '@/db/repositories';
import type { WeeklyReport } from '@/lib/weeklyReport';

export default function BilanScreen() {
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [archive, setArchive] = useState<{ week_start: string; json: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await buildWeeklyReport(new Date());
      setReport(r);
      setArchive(await getArchivedReports());
    } finally {
      setBusy(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const exportPdf = async () => {
    if (!report) return;
    try {
      const { uri } = await Print.printToFileAsync({ html: reportHtml(report) });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('Export impossible', 'Réessaie plus tard.');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 40 }}
    >
      <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: '900' }}>Bilan hebdo</Text>
      <Text style={{ color: COLORS.muted, marginBottom: 16 }}>Semaine en cours · maj auto</Text>

      {busy && <Text style={{ color: COLORS.muted }}>Calcul…</Text>}

      {report && (
        <>
          {/* Reco */}
          <Card style={{ borderColor: COLORS.accent, marginBottom: 14 }}>
            <Text style={{ color: COLORS.accent, fontWeight: '800', marginBottom: 6 }}>🎯 Recommandation</Text>
            <Text style={{ color: COLORS.text, fontSize: 15, lineHeight: 21 }}>{report.recommendation}</Text>
          </Card>

          {/* Nutrition */}
          <Card style={{ marginBottom: 12 }}>
            <SectionTitle>Nutrition</SectionTitle>
            <Row label="Kcal moy / jour" value={`${report.nutrition.avg_kcal_per_day}`} />
            <Row label="Protéines moy" value={`${report.nutrition.avg_protein} g`} />
            <Row label="Jours cible protéines" value={`${report.nutrition.days_hit_protein_target} / 7`} />
            <Row label="Jours > 2550 kcal" value={`${report.nutrition.days_over_kcal_target}`} />
            <Row label="Compliance" value={`${report.nutrition.compliance_pct} %`} />
          </Card>

          {/* Training */}
          <Card style={{ marginBottom: 12 }}>
            <SectionTitle>Entraînement</SectionTitle>
            <Row label="Séances" value={`${report.training.sessions_completed} / ${report.training.sessions_planned}`} />
            <Row label="Volume total" value={`${report.training.total_volume_kg} kg`} />
            <Row label="Records" value={report.training.prs_this_week.length ? report.training.prs_this_week.join(', ') : 'Aucun'} />
          </Card>

          {/* Corps */}
          <Card style={{ marginBottom: 14 }}>
            <SectionTitle>Composition</SectionTitle>
            <Row label="Poids actuel" value={report.body.weight_current != null ? `${report.body.weight_current} kg` : '—'} />
            <Row label="Δ semaine" value={report.body.weight_delta_kg != null ? `${report.body.weight_delta_kg > 0 ? '+' : ''}${report.body.weight_delta_kg} kg` : '—'} />
            <Row label="Tendance" value={trendLabel(report.body.trend)} />
          </Card>

          <Button title="📄 Exporter en PDF" onPress={exportPdf} />
        </>
      )}

      {archive.length > 1 && (
        <View style={{ marginTop: 22 }}>
          <SectionTitle>Archives</SectionTitle>
          {archive.slice(1).map((a) => {
            const r = JSON.parse(a.json) as WeeklyReport;
            return (
              <Card key={a.week_start} style={{ marginBottom: 8 }}>
                <Text style={{ color: COLORS.text, fontWeight: '700' }}>Semaine du {a.week_start}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
                  {r.nutrition.avg_kcal_per_day} kcal/j · {r.training.sessions_completed}/4 séances · Δ {r.body.weight_delta_kg ?? '—'} kg
                </Text>
              </Card>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
      <Text style={{ color: COLORS.muted, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

function trendLabel(t: WeeklyReport['body']['trend']): string {
  return { loss: '↓ Perte', gain: '↑ Gain', stable: '→ Stable', unknown: '—' }[t];
}

function reportHtml(r: WeeklyReport): string {
  return `
  <html><head><meta charset="utf-8"/><style>
    body{font-family:-apple-system,Helvetica,Arial;padding:28px;color:#0B2545}
    h1{color:#E85D04} h2{border-bottom:2px solid #E85D04;padding-bottom:4px}
    .reco{background:#FFF3E9;border-left:4px solid #E85D04;padding:12px;border-radius:8px}
    table{width:100%;border-collapse:collapse;margin:8px 0}
    td{padding:6px 0;border-bottom:1px solid #eee}
    td:last-child{text-align:right;font-weight:700}
  </style></head><body>
  <h1>FitCoach — Bilan hebdomadaire</h1>
  <div class="reco"><b>Recommandation :</b> ${r.recommendation}</div>
  <h2>Nutrition</h2><table>
    <tr><td>Kcal moy/jour</td><td>${r.nutrition.avg_kcal_per_day}</td></tr>
    <tr><td>Protéines moy</td><td>${r.nutrition.avg_protein} g</td></tr>
    <tr><td>Jours cible protéines</td><td>${r.nutrition.days_hit_protein_target}/7</td></tr>
    <tr><td>Compliance</td><td>${r.nutrition.compliance_pct}%</td></tr>
  </table>
  <h2>Entraînement</h2><table>
    <tr><td>Séances</td><td>${r.training.sessions_completed}/${r.training.sessions_planned}</td></tr>
    <tr><td>Volume total</td><td>${r.training.total_volume_kg} kg</td></tr>
    <tr><td>Records</td><td>${r.training.prs_this_week.join(', ') || 'Aucun'}</td></tr>
  </table>
  <h2>Composition</h2><table>
    <tr><td>Poids actuel</td><td>${r.body.weight_current ?? '—'} kg</td></tr>
    <tr><td>Δ semaine</td><td>${r.body.weight_delta_kg ?? '—'} kg</td></tr>
  </table>
  </body></html>`;
}
