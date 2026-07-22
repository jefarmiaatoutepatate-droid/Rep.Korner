import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS } from '@/constants/theme';
import { Card, SectionHeader, Button, GradientBg, IconButton } from '@/components/ui';
import { Icon } from '@/components/Icon';
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
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <GradientBg />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 110 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.muted, fontSize: 12.5 }}>Semaine en cours · maj auto</Text>
            <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 }}>Bilan hebdo</Text>
          </View>
          <IconButton icon="report" />
        </View>

        {busy && <Text style={{ color: COLORS.faint }}>Calcul…</Text>}

        {report && (
          <>
            {/* Recommandation — surface claire */}
            <Card variant="light">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon name="chart" size={15} color={COLORS.accentInk} strokeWidth={2} />
                <Text style={{ color: COLORS.accentInk, fontWeight: '700', fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.8 }}>Recommandation</Text>
              </View>
              <Text style={{ color: COLORS.onLight, fontSize: 14.5, lineHeight: 21 }}>{report.recommendation}</Text>
            </Card>

            <SectionHeader title="Nutrition" />
            <Card>
              <Row label="Kcal moyennes / jour" value={`${report.nutrition.avg_kcal_per_day}`} />
              <Row label="Protéines moyennes" value={`${report.nutrition.avg_protein} g`} divider />
              <Row label="Jours cible protéines" value={`${report.nutrition.days_hit_protein_target} / 7`} divider />
              <Row label="Jours > 2550 kcal" value={`${report.nutrition.days_over_kcal_target}`} divider />
              <Row label="Compliance" value={`${report.nutrition.compliance_pct} %`} valueColor={COLORS.success} divider />
            </Card>

            <SectionHeader title="Entraînement" />
            <Card>
              <Row label="Séances" value={`${report.training.sessions_completed} / ${report.training.sessions_planned}`} />
              <Row label="Volume total" value={`${report.training.total_volume_kg} kg`} divider />
              <Row label="Records" value={report.training.prs_this_week.length ? report.training.prs_this_week.join(', ') : 'Aucun'} valueColor={report.training.prs_this_week.length ? COLORS.success : undefined} divider />
            </Card>

            <SectionHeader title="Composition" />
            <Card>
              <Row label="Poids actuel" value={report.body.weight_current != null ? `${report.body.weight_current} kg` : '—'} />
              <Row label="Δ semaine" value={report.body.weight_delta_kg != null ? `${report.body.weight_delta_kg > 0 ? '+' : ''}${report.body.weight_delta_kg} kg` : '—'} valueColor={report.body.trend === 'loss' ? COLORS.success : undefined} divider />
              <Row label="Tendance" value={trendLabel(report.body.trend)} divider />
            </Card>

            <Button title="Exporter en PDF" icon="report" onPress={exportPdf} style={{ marginTop: 16 }} />
          </>
        )}

        {archive.length > 1 && (
          <>
            <SectionHeader title="Archives" />
            <View style={{ gap: 8 }}>
              {archive.slice(1).map((a) => {
                const r = JSON.parse(a.json) as WeeklyReport;
                return (
                  <Card key={a.week_start}>
                    <Text style={{ color: COLORS.text, fontWeight: '700' }}>Semaine du {a.week_start}</Text>
                    <Text style={{ color: COLORS.faint, fontSize: 11.5, marginTop: 2 }}>
                      {r.nutrition.avg_kcal_per_day} kcal/j · {r.training.sessions_completed}/4 séances · Δ {r.body.weight_delta_kg ?? '—'} kg
                    </Text>
                  </Card>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Row({ label, value, valueColor, divider }: { label: string; value: string; valueColor?: string; divider?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderTopWidth: divider ? 1 : 0, borderTopColor: COLORS.border }}>
      <Text style={{ color: COLORS.muted, fontSize: 13.5 }}>{label}</Text>
      <Text style={{ color: valueColor ?? COLORS.text, fontSize: 13.5, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

function trendLabel(t: WeeklyReport['body']['trend']): string {
  return { loss: '↓ Perte', gain: '↑ Gain', stable: '→ Stable', unknown: '—' }[t];
}

function reportHtml(r: WeeklyReport): string {
  return `
  <html><head><meta charset="utf-8"/><style>
    body{font-family:-apple-system,Helvetica,Arial;padding:28px;color:#141B33}
    h1{color:#4E5FC7} h2{border-bottom:2px solid #7C93FF;padding-bottom:4px;color:#141B33}
    .reco{background:#EEF1FC;border-left:4px solid #7C93FF;padding:12px;border-radius:8px}
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
