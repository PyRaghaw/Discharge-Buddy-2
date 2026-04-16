import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G, Rect, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MascotBuddy } from "@/components/MascotBuddy";
import colors from "@/constants/colors";
import { getLevel, useApp } from "@/context/AppContext";
import { useSidebar } from "@/context/SidebarContext";

const { width } = Dimensions.get("window");
const theme = colors.light;
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE";

function AnimatedPressable({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, friction: 8 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }).start();

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

function CircularProgress({ pct, size = 110 }: { pct: number; size?: number }) {
  const stroke = 10;
  const r = (size - stroke * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth={stroke} fill="none" />
      <Circle
        cx={cx} cy={cy} r={r}
        stroke="#ffffff"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${cx},${cy}`}
      />
      <SvgText
        x={cx} y={cy - 6}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="24"
        fontFamily="Inter_700Bold"
      >
        {pct}%
      </SvgText>
      <SvgText
        x={cx} y={cy + 14}
        textAnchor="middle"
        fill="rgba(255,255,255,0.75)"
        fontSize="10"
        fontFamily="Inter_500Medium"
      >
        adherence
      </SvgText>
    </Svg>
  );
}

function WeeklyBars({ taken = 0, total = 0 }: { taken: number; total: number }) {
  const today = new Date();
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const todayIdx = (today.getDay() + 6) % 7;
  const barW = 22;
  const barH = 64;
  const chartW = Math.min(width - 48, 340);
  const gap = (chartW - days.length * barW) / (days.length - 1);
  const baseData = [92, 100, 75, 90, 100, 85, 0];
  const todayPct = total > 0 ? (taken / total) * 100 : 0;
  const vals = baseData.map((v, i) => (i === todayIdx ? todayPct : i < todayIdx ? v : 0));

  return (
    <Svg width={chartW} height={barH + 24} viewBox={`0 0 ${chartW} ${barH + 24}`}>
      {days.map((d, i) => {
        const pct = vals[i] / 100;
        const h = Math.max(4, Math.round(pct * barH));
        const x = i * (barW + gap);
        const y = barH - h;
        const isToday = i === todayIdx;
        return (
          <G key={i}>
            <Rect x={x} y={0} width={barW} height={barH} rx={11} ry={11} fill="rgba(255,255,255,0.15)" />
            {pct > 0 && (
              <Rect x={x} y={y} width={barW} height={h} rx={11} ry={11}
                fill={isToday ? "#fff" : "rgba(255,255,255,0.65)"} />
            )}
            <SvgText
              x={x + barW / 2} y={barH + 18}
              textAnchor="middle"
              fill={isToday ? "#fff" : "rgba(255,255,255,0.6)"}
              fontSize="11"
              fontWeight={isToday ? "700" : "500"}
            >{d}</SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { role } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  if (role === "caregiver") return <CaregiverDashboard topInset={topInset} />;
  return <PatientDashboard topInset={topInset} />;
}

function QuickAction({ icon, label, color, onPress }: { icon: any; label: string; color: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      style={styles.quickItem}
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, friction: 8 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }).start()}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <View style={[styles.quickCircle, { backgroundColor: `${color}14`, borderColor: `${color}28` }]}>
          <Feather name={icon} size={24} color={color} />
        </View>
        <Text style={styles.quickLabel}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function PatientDashboard({ topInset }: { topInset: number }) {
  const { user, todayDoses, medicines, followUps, updateDoseStatus } = useApp();
  const { open: openSidebar } = useSidebar();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const taken = todayDoses.filter((d) => d.status === "taken").length;
  const total = todayDoses.length;
  const missed = todayDoses.filter((d) => d.status === "missed").length;
  const pending = todayDoses.filter((d) => d.status === "pending").length;
  const adherencePct = total > 0 ? Math.round((taken / total) * 100) : 0;
  const upcomingFollowUp = followUps.find((f) => !f.completed);
  const [showAll, setShowAll] = useState(false);

  const recentActivity = todayDoses
    .slice(0, showAll ? undefined : 4)
    .map((dose) => ({ dose, med: medicines.find((m) => m.id === dose.medicineId) }));

  const riskColor = missed >= 2 ? "#EF4444" : missed === 1 ? "#F59E0B" : "#10B981";
  const riskLabel = missed >= 2 ? "High Risk" : missed === 1 ? "Moderate" : "On Track";
  const firstName = (user?.name ?? "Friend").split(" ")[0];

  const greetHour = new Date().getHours();
  const greet = greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F7FF" }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 100 }}>

        {/* ── Hero Header ── */}
        <LinearGradient
          colors={["#5B21B6", "#7C3AED", "#9333EA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerBg, { paddingTop: topInset + 16 }]}
        >
          {/* Decorative circles */}
          <View style={styles.decor1} />
          <View style={styles.decor2} />

          {/* Top bar */}
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={openSidebar} style={styles.iconBtn}>
              <Feather name="menu" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.greetBlock}>
              <Text style={styles.greetText}>{greet}</Text>
              <Text style={styles.nameText}>{firstName} 👋</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/notifications")} style={styles.iconBtn}>
              <Feather name="bell" size={20} color="#fff" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Mascot */}
          <MascotBuddy size={88} />

          {/* Stats row */}
          <View style={styles.statsCard}>
            <CircularProgress pct={adherencePct} size={108} />
            <View style={styles.statsRight}>
              <View style={[styles.riskBadge, { backgroundColor: `${riskColor}22` }]}>
                <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
                <Text style={[styles.riskText, { color: riskColor === "#10B981" ? "#fff" : riskColor }]}>
                  {riskLabel}
                </Text>
              </View>
              <View style={styles.dosesRow}>
                <View>
                  <Text style={styles.dosesMain}>{taken}/{total}</Text>
                  <Text style={styles.dosesLabel}>doses today</Text>
                </View>
                <View style={styles.missedRow}>
                  <View style={styles.missedChip}>
                    <Text style={styles.missedNum}>{missed}</Text>
                    <Text style={styles.missedLbl}>missed</Text>
                  </View>
                  <View style={styles.pendingChip}>
                    <Text style={styles.missedNum}>{pending}</Text>
                    <Text style={styles.missedLbl}>pending</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Weekly chart */}
          <View style={styles.weeklyWrap}>
            <View style={styles.weeklyHeader}>
              <Feather name="bar-chart-2" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.weeklyLabel}>This Week</Text>
            </View>
            <WeeklyBars taken={taken} total={total} />
          </View>

        </LinearGradient>

        {/* ── Quick Actions ── */}
        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickRow}>
            <QuickAction icon="activity" label="Symptoms" color="#EF4444" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/symptoms" as any); }} />
            <QuickAction icon="calendar" label="Schedule" color="#7C3AED" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/schedule" as any); }} />
            <QuickAction icon="message-circle" label="AI Help" color="#06B6D4" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/chat" as any); }} />
            <QuickAction icon="alert-triangle" label="Emergency" color="#F59E0B" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); router.push("/emergency" as any); }} />
          </View>
        </View>

        {/* ── Follow-up Banner ── */}
        {upcomingFollowUp && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/followups" as any)}
            style={styles.followupCard}
            activeOpacity={0.85}
          >
            <LinearGradient colors={["#EDE9FE", "#F5F3FF"]} style={styles.followupGrad}>
              <View style={styles.followupLeft}>
                <View style={styles.followupIconWrap}>
                  <Feather name="calendar" size={20} color={PURPLE} />
                </View>
                <View>
                  <Text style={styles.followupTitle}>Upcoming Appointment</Text>
                  <Text style={styles.followupName}>{upcomingFollowUp.title}</Text>
                  <Text style={styles.followupDate}>
                    {new Date(upcomingFollowUp.dateTime).toLocaleDateString("en", {
                      weekday: "short", month: "short", day: "numeric",
                    })} · {upcomingFollowUp.doctorName}
                  </Text>
                </View>
              </View>
              <View style={styles.followupArrow}>
                <Feather name="chevron-right" size={18} color={PURPLE} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Recent Doses ── */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Doses</Text>
            <TouchableOpacity onPress={() => setShowAll(!showAll)}>
              <Text style={styles.seeAll}>{showAll ? "Show less" : "See all"}</Text>
            </TouchableOpacity>
          </View>

          {recentActivity.length === 0 ? (
            <View style={styles.emptyDoses}>
              <Text style={styles.emptyEmoji}>🌟</Text>
              <Text style={styles.emptyText}>All doses are clear today!</Text>
            </View>
          ) : (
            recentActivity.map(({ dose, med }) => {
              if (!med) return null;
              const statusColor = dose.status === "taken" ? "#10B981" : dose.status === "missed" ? "#EF4444" : PURPLE;
              const statusIcon = dose.status === "taken" ? "check-circle" : dose.status === "missed" ? "x-circle" : "clock";
              return (
                <View key={dose.id} style={styles.doseRow}>
                  <View style={[styles.doseIcon, { backgroundColor: `${med.color}15` }]}>
                    <Feather name="package" size={20} color={med.color} />
                  </View>
                  <View style={styles.doseInfo}>
                    <Text style={styles.doseName}>{dose.medicineName}</Text>
                    <Text style={styles.doseSub}>{med.dosage} · {dose.scheduledTime}</Text>
                  </View>
                  <View style={[styles.doseStatus, { backgroundColor: `${statusColor}12` }]}>
                    <Feather name={statusIcon as any} size={18} color={statusColor} />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function CaregiverDashboard({ topInset }: { topInset: number }) {
  const { user, linkedPatients } = useApp();
  const { open: openSidebar } = useSidebar();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const patient = linkedPatients[0];

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F7FF" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 100 }}>
        <LinearGradient
          colors={["#5B21B6", "#7C3AED", "#9333EA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerBg, { paddingTop: topInset + 16 }]}
        >
          <View style={styles.decor1} />
          <View style={styles.decor2} />
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={openSidebar} style={styles.iconBtn}>
              <Feather name="menu" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.greetBlock}>
              <Text style={styles.greetText}>Caregiver Mode</Text>
              <Text style={styles.nameText}>{(user?.name ?? "Caregiver").split(" ")[0]} 💜</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="settings" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <MascotBuddy size={88} message="Hi! Let's keep our patient safe and healthy today! 💜" />
          <View style={styles.careStats}>
            <View style={styles.careStat}>
              <Text style={styles.careStatVal}>98%</Text>
              <Text style={styles.careStatLbl}>Adherence</Text>
            </View>
            <View style={styles.careStatDivider} />
            <View style={styles.careStat}>
              <Text style={styles.careStatVal}>0</Text>
              <Text style={styles.careStatLbl}>Alerts</Text>
            </View>
            <View style={styles.careStatDivider} />
            <View style={styles.careStat}>
              <Text style={styles.careStatVal}>Stable</Text>
              <Text style={styles.careStatLbl}>Status</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>Caregiver Actions</Text>
          <View style={styles.quickRow}>
            <QuickAction icon="eye" label="Monitor" color={PURPLE} onPress={() => {}} />
            <QuickAction icon="bell" label="Remind" color="#F59E0B" onPress={() => {}} />
            <QuickAction icon="message-circle" label="Message" color="#06B6D4" onPress={() => {}} />
            <QuickAction icon="alert-triangle" label="Alert" color="#EF4444" onPress={() => {}} />
          </View>
        </View>

        {patient && (
          <View style={styles.patientCard}>
            <View style={styles.patientAvatar}>
              <Feather name="user" size={24} color={PURPLE} />
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientStatus}>Recovery in progress · Stable condition</Text>
            </View>
            <View style={[styles.patientBadge, { backgroundColor: "#DCFCE7" }]}>
              <Text style={[styles.patientBadgeText, { color: "#16A34A" }]}>Stable</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: {
    paddingBottom: 28,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  decor1: {
    position: "absolute", width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.06)", top: -50, right: -40,
  },
  decor2: {
    position: "absolute", width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)", bottom: -20, left: -20,
  },
  headerTop: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, marginBottom: 4,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  greetBlock: { alignItems: "center" },
  greetText: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_400Regular" },
  nameText: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
  notifDot: {
    position: "absolute", top: 10, right: 10,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: "#FCD34D",
    borderWidth: 1.5, borderColor: "#7C3AED",
  },

  statsCard: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, gap: 20, marginTop: 6,
  },
  statsRight: { flex: 1, gap: 6 },
  riskBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  riskDot: { width: 7, height: 7, borderRadius: 4 },
  riskText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  dosesRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dosesMain: { color: "#fff", fontSize: 30, fontFamily: "Inter_700Bold", lineHeight: 36 },
  dosesLabel: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_400Regular" },
  missedRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  missedChip: {
    backgroundColor: "rgba(239,68,68,0.2)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    alignItems: "center",
  },
  pendingChip: {
    backgroundColor: "rgba(245,158,11,0.2)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    alignItems: "center",
  },
  missedNum: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  missedLbl: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "Inter_400Regular" },

  weeklyWrap: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 24, padding: 16,
    marginHorizontal: 20, marginTop: 20,
  },
  weeklyHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  weeklyLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Inter_500Medium" },


  quickSection: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 6 },
  quickRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  quickItem: { alignItems: "center", flex: 1 },
  quickCircle: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, marginBottom: 8,
    shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  quickLabel: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: "#4B5563", textAlign: "center",
  },

  followupCard: { marginHorizontal: 20, marginTop: 20, borderRadius: 24, overflow: "hidden" },
  followupGrad: { padding: 18, flexDirection: "row", alignItems: "center" },
  followupLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  followupIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  followupTitle: { fontSize: 11, fontFamily: "Inter_500Medium", color: PURPLE, marginBottom: 2 },
  followupName: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1E1B4B" },
  followupDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B7280", marginTop: 2 },
  followupArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },

  recentSection: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1E1B4B" },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: PURPLE },

  doseRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff", borderRadius: 18, padding: 14,
    marginBottom: 10,
    shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  doseIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  doseInfo: { flex: 1 },
  doseName: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E1B4B" },
  doseSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B7280", marginTop: 2 },
  doseStatus: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },

  emptyDoses: { alignItems: "center", paddingVertical: 28, gap: 8 },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: "#6B7280" },

  careStats: {
    flexDirection: "row", marginHorizontal: 20, marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20, padding: 18,
    alignItems: "center", justifyContent: "space-between",
  },
  careStat: { flex: 1, alignItems: "center" },
  careStatVal: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  careStatLbl: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  careStatDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.2)" },

  patientCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: "#fff", borderRadius: 20, padding: 16,
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  patientAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: PURPLE_LIGHT, alignItems: "center", justifyContent: "center",
  },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1E1B4B" },
  patientStatus: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B7280", marginTop: 2 },
  patientBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  patientBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
});
