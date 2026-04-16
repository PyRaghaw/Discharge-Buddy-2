import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Ellipse, Path, G } from "react-native-svg";

import { MascotBuddy } from "@/components/MascotBuddy";
import { useApp } from "@/context/AppContext";

const { width, height } = Dimensions.get("window");
const WHITE = "#ffffff";
const PURPLE = "#7C3AED";

const SLIDES = [
  {
    id: "1",
    gradientStart: "#4C1D95",
    gradientEnd: "#7C3AED",
    emoji: "💜",
    title: "Your Recovery,\nSimplified",
    subtitle: "DischargeBuddy turns complex hospital papers into a clear, manageable daily plan — just for you.",
    mascotMessage: "Hi! I'm Beary. I'll be your recovery buddy! 🐾",
  },
  {
    id: "2",
    gradientStart: "#3B0764",
    gradientEnd: "#6D28D9",
    emoji: "💊",
    title: "Never Miss\nA Dose",
    subtitle: "Smart reminders at exactly the right time. Scan your prescription and we build your medicine schedule automatically.",
    mascotMessage: "I'll remind you to take your medicines on time! ⏰",
  },
  {
    id: "3",
    gradientStart: "#312E81",
    gradientEnd: "#5B21B6",
    emoji: "👨‍👩‍👧",
    title: "Family\nSupport",
    subtitle: "Family members can monitor your recovery, get instant alerts on missed doses, and respond to emergencies remotely.",
    mascotMessage: "Your whole family can stay connected and informed! 💜",
  },
];

function FloatingBubble({ x, y, label, color, delay = 0 }: { x: number; y: number; label: string; color: string; delay?: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(-10, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ), -1, false
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
    position: "absolute",
    left: x,
    top: y,
  }));

  return (
    <Animated.View style={style}>
      <View style={[bubble.chip, { backgroundColor: `${color}25`, borderColor: `${color}50` }]}>
        <View style={[bubble.dot, { backgroundColor: color }]} />
        <Text style={bubble.label}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const bubble = StyleSheet.create({
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 50, borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", color: WHITE },
});

function Slide1Visual() {
  const pulse = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withSequence(
      withTiming(1.12, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
    ), -1, false);
    rotate.value = withRepeat(withTiming(360, { duration: 16000, easing: Easing.linear }), -1, false);
  }, []);

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const orbitStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));

  return (
    <View style={vs.container}>
      <Animated.View style={[vs.orbitRing, orbitStyle]}>
        <View style={[vs.orbitDot, { backgroundColor: "#C4B5FD", top: -8, left: "50%" }]} />
        <View style={[vs.orbitDot, { backgroundColor: "#DDD6FE", bottom: -8, left: "50%" }]} />
        <View style={[vs.orbitDot, { backgroundColor: "#A78BFA", left: -8, top: "50%" }]} />
        <View style={[vs.orbitDot, { backgroundColor: "#EDE9FE", right: -8, top: "50%" }]} />
      </Animated.View>
      <View style={vs.centralOuter}>
        <View style={vs.centralInner}>
          <Animated.View style={heartStyle}>
            <Feather name="heart" size={52} color={WHITE} />
          </Animated.View>
        </View>
      </View>
      <FloatingBubble x={18} y={55} label="Metformin 500mg" color="#C4B5FD" delay={200} />
      <FloatingBubble x={width * 0.5} y={45} label="Lisinopril 10mg" color="#A78BFA" delay={500} />
      <FloatingBubble x={24} y={height * 0.25} label="Aspirin 81mg" color="#DDD6FE" delay={800} />
      <Animated.View entering={FadeInUp.delay(600).springify()} style={vs.statsCard}>
        <View style={vs.statsRow}>
          <Feather name="check-circle" size={15} color="#10B981" />
          <Text style={vs.statsText}>4 doses tracked today</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function Slide2Visual() {
  const ring1 = useSharedValue(1);
  const ring2 = useSharedValue(1);
  const bellBounce = useSharedValue(0);

  useEffect(() => {
    ring1.value = withRepeat(withSequence(withTiming(1.6, { duration: 1200 }), withTiming(1, { duration: 0 })), -1, false);
    ring2.value = withDelay(400, withRepeat(withSequence(withTiming(1.9, { duration: 1200 }), withTiming(1, { duration: 0 })), -1, false));
    bellBounce.value = withRepeat(withSequence(
      withTiming(-8, { duration: 200 }), withTiming(8, { duration: 200 }),
      withTiming(-5, { duration: 150 }), withTiming(5, { duration: 150 }),
      withTiming(0, { duration: 100 }), withTiming(0, { duration: 1600 })
    ), -1, false);
  }, []);

  const r1 = useAnimatedStyle(() => ({ transform: [{ scale: ring1.value }], opacity: interpolate(ring1.value, [1, 1.6], [0.6, 0]) }));
  const r2 = useAnimatedStyle(() => ({ transform: [{ scale: ring2.value }], opacity: interpolate(ring2.value, [1, 1.9], [0.4, 0]) }));
  const bell = useAnimatedStyle(() => ({ transform: [{ rotate: `${bellBounce.value}deg` }] }));

  const SCHEDULE = [
    { time: "8:00 AM", med: "Metformin", done: true },
    { time: "12:00 PM", med: "Aspirin", done: true },
    { time: "8:00 PM", med: "Atorvastatin", done: false },
    { time: "9:00 PM", med: "Lisinopril", done: false },
  ];

  return (
    <View style={vs.container}>
      <View style={vs.bellPulse}>
        <Animated.View style={[vs.pulseRing, { borderColor: "#A78BFA" }, r2]} />
        <Animated.View style={[vs.pulseRing, { borderColor: "#C4B5FD" }, r1]} />
        <View style={vs.bellCircle}>
          <Animated.View style={bell}>
            <Feather name="bell" size={40} color={WHITE} />
          </Animated.View>
        </View>
      </View>
      <Animated.View entering={FadeInUp.delay(400).springify()} style={vs.schedCard}>
        {SCHEDULE.map((item, i) => (
          <View key={i} style={[vs.schedRow, i < SCHEDULE.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#EDE9FE" }]}>
            <View style={[vs.schedCheck, { backgroundColor: item.done ? "#7C3AED" : "transparent", borderColor: item.done ? "#7C3AED" : "#CBD5E1" }]}>
              {item.done && <Feather name="check" size={11} color={WHITE} />}
            </View>
            <Text style={[vs.schedTime, { color: item.done ? "#9CA3AF" : "#1E1B4B" }]}>{item.time}</Text>
            <Text style={[vs.schedMed, { color: item.done ? "#9CA3AF" : "#1E1B4B", textDecorationLine: item.done ? "line-through" : "none" }]}>{item.med}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function Slide3Visual() {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.2)) });
    rotate.value = withRepeat(withTiming(360, { duration: 14000, easing: Easing.linear }), -1, false);
  }, []);

  const orbitStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));
  const centerStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const R = 105;
  const DIAM = R * 2 + 52;
  const NODES = [
    { icon: "user" as const, label: "Patient", color: "#C4B5FD", angle: 0 },
    { icon: "users" as const, label: "Family", color: "#A78BFA", angle: 72 },
    { icon: "activity" as const, label: "Doctor", color: "#DDD6FE", angle: 144 },
    { icon: "shield" as const, label: "Nurse", color: "#EDE9FE", angle: 216 },
    { icon: "phone" as const, label: "Emergency", color: "#C4B5FD", angle: 288 },
  ];

  return (
    <View style={vs.container}>
      <View style={{ width: DIAM, height: DIAM, alignItems: "center", justifyContent: "center" }}>
        <Animated.View style={[{ position: "absolute", width: DIAM, height: DIAM }, orbitStyle]}>
          {NODES.map((node, i) => {
            const rad = (node.angle * Math.PI) / 180;
            return (
              <View key={i} style={[vs.networkNode, {
                left: R + Math.cos(rad) * R - 26,
                top: R + Math.sin(rad) * R - 26,
                backgroundColor: `${node.color}30`,
                borderColor: `${node.color}80`,
              }]}>
                <Feather name={node.icon} size={20} color={node.color} />
              </View>
            );
          })}
        </Animated.View>
        <Animated.View style={[vs.centerNode, centerStyle]}>
          <Feather name="heart" size={26} color={WHITE} />
        </Animated.View>
      </View>
      <Animated.View entering={FadeInDown.delay(700).springify()} style={vs.connBadge}>
        <Feather name="wifi" size={13} color="#10B981" />
        <Text style={vs.connText}>5 caregivers connected</Text>
      </Animated.View>
    </View>
  );
}

const VISUALS = [Slide1Visual, Slide2Visual, Slide3Visual];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setOnboarded } = useApp();
  const flatRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setCurrent(viewableItems[0].index);
  }).current;

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1, animated: true });
    } else {
      setOnboarded(true);
      router.replace("/login");
    }
  };

  const VISUAL_HEIGHT = height * 0.52;
  const slide = SLIDES[current];

  return (
    <LinearGradient
      colors={[slide.gradientStart, slide.gradientEnd]}
      style={styles.screen}
    >
      {/* Decorative circles */}
      <View style={styles.decorTop} />
      <View style={styles.decorBottom} />

      {/* Skip button */}
      <Pressable onPress={() => { setOnboarded(true); router.replace("/login"); }}
        style={[styles.skipBtn, { top: topInset + 12 }]}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Slide pager */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
        style={{ height: VISUAL_HEIGHT, flexGrow: 0 }}
        renderItem={({ item, index }) => {
          const Visual = VISUALS[index];
          return (
            <View style={{ width, height: VISUAL_HEIGHT }}>
              <Visual />
            </View>
          );
        }}
      />

      {/* Bottom card */}
      <View style={[styles.card, { paddingBottom: bottomInset + 16 }]}>
        {/* Mascot + message */}
        <Animated.View key={`mascot-${current}`} entering={FadeIn.duration(350)} style={styles.mascotWrap}>
          <MascotBuddy size={72} message={slide.mascotMessage} />
        </Animated.View>

        {/* Slide text */}
        <Animated.View key={current} entering={FadeInUp.duration(350)} style={styles.textWrap}>
          <Text style={styles.slideEmoji}>{slide.emoji}</Text>
          <Text style={styles.cardTitle}>{slide.title}</Text>
          <Text style={styles.cardSubtitle}>{slide.subtitle}</Text>
        </Animated.View>

        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              flatRef.current?.scrollToIndex({ index: i, animated: true });
              setCurrent(i);
            }}>
              <Animated.View style={[styles.dot, {
                backgroundColor: i === current ? PURPLE : "#E8E4FF",
                width: i === current ? 32 : 8,
              }]} />
            </Pressable>
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity onPress={goNext} style={styles.nextBtn} activeOpacity={0.88}>
          <Text style={styles.nextBtnText}>
            {current === SLIDES.length - 1 ? "Get Started 🚀" : "Next"}
          </Text>
          <View style={styles.nextArrow}>
            <Feather name="arrow-right" size={18} color={PURPLE} />
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const vs = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  orbitRing: {
    position: "absolute", width: 200, height: 200, borderRadius: 100,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.2)", borderStyle: "dashed",
  },
  orbitDot: { position: "absolute", width: 10, height: 10, borderRadius: 5, marginLeft: -5, marginTop: -5 },
  centralOuter: {
    width: 118, height: 118, borderRadius: 59,
    backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center",
  },
  centralInner: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center",
  },
  statsCard: {
    position: "absolute", left: width * 0.08, bottom: 40,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statsText: { color: WHITE, fontSize: 13, fontFamily: "Inter_500Medium" },
  bellPulse: { width: 116, height: 116, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  pulseRing: { position: "absolute", width: 116, height: 116, borderRadius: 58, borderWidth: 2 },
  bellCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)",
  },
  schedCard: {
    backgroundColor: WHITE, borderRadius: 22, paddingVertical: 4, paddingHorizontal: 16,
    width: width * 0.76,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8,
  },
  schedRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11 },
  schedCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  schedTime: { fontSize: 12, fontFamily: "Inter_500Medium", width: 64 },
  schedMed: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  networkNode: {
    position: "absolute", width: 52, height: 52, borderRadius: 26,
    borderWidth: 1.5, alignItems: "center", justifyContent: "center",
  },
  centerNode: {
    position: "absolute", width: 66, height: 66, borderRadius: 33,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center", justifyContent: "center",
  },
  connBadge: {
    flexDirection: "row", alignItems: "center", gap: 8, marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 50,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.28)",
  },
  connText: { color: WHITE, fontSize: 13, fontFamily: "Inter_500Medium" },
});

const styles = StyleSheet.create({
  screen: { flex: 1 },
  decorTop: {
    position: "absolute", width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.05)", top: -60, right: -60,
  },
  decorBottom: {
    position: "absolute", width: 140, height: 140, borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.04)", bottom: "40%", left: -40,
  },
  skipBtn: {
    position: "absolute", right: 20, zIndex: 10,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  skipText: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontFamily: "Inter_500Medium" },
  card: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 24, paddingTop: 24, gap: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06, shadowRadius: 20, elevation: 14,
    flex: 1,
  },
  mascotWrap: { marginTop: -10 },
  textWrap: { gap: 8, flex: 1 },
  slideEmoji: { fontSize: 28 },
  cardTitle: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#1E1B4B", lineHeight: 38 },
  cardSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#6B7280", lineHeight: 24 },
  dots: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    backgroundColor: PURPLE,
    borderRadius: 20, paddingVertical: 18,
    paddingLeft: 28, paddingRight: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  nextBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: WHITE, flex: 1 },
  nextArrow: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: WHITE, alignItems: "center", justifyContent: "center",
  },
});
