import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE";

const shadow = (color: string, blur: number, y: number, opacity: number) =>
  isWeb
    ? { boxShadow: `0px ${y}px ${blur}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}` }
    : {
        shadowColor: color,
        shadowOffset: { width: 0, height: y },
        shadowOpacity: opacity,
        shadowRadius: blur,
        elevation: blur,
      };

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

const FAB_ACTIONS = [
  { icon: "camera" as FeatherIconName, label: "Scan Rx", route: "/scan", color: "#7C3AED" },
  { icon: "book-open" as FeatherIconName, label: "Journal", route: "/journal", color: "#A78BFA" },
  { icon: "heart" as FeatherIconName, label: "Emergency", route: "/emergency-card", color: "#EF4444" },
];

interface FloatingTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const bottomPad = Platform.OS === "web" ? 16 : Math.max(insets.bottom, 8);

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.spring(fabAnim, { toValue, useNativeDriver: !isWeb, tension: 130, friction: 8 }),
      Animated.timing(overlayAnim, { toValue, duration: 200, useNativeDriver: !isWeb }),
    ]).start();
    setFabOpen(!fabOpen);
  };

  const closeFab = () => {
    Animated.parallel([
      Animated.spring(fabAnim, { toValue: 0, useNativeDriver: !isWeb }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 150, useNativeDriver: !isWeb }),
    ]).start();
    setFabOpen(false);
  };

  const handleFabAction = (route: string) => {
    closeFab();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => router.push(route as any), 100);
  };

  const fabRotation = fabAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] });

  const visibleRoutes = state.routes
    .map((route: any, index: number) => ({ route, index }))
    .filter((item: any) => descriptors[item.route.key].options.tabBarIcon !== undefined);

  const leftRoutes = visibleRoutes.slice(0, 2);
  const rightRoutes = visibleRoutes.slice(2);

  const renderTab = (item: { route: any; index: number }) => {
    const { route, index: actualIndex } = item;
    const { options } = descriptors[route.key];
    const label = options.tabBarLabel ?? options.title ?? route.name;
    const isFocused = state.index === actualIndex;
    const tabScale = useRef(new Animated.Value(1)).current;

    const onPress = () => {
      Animated.sequence([
        Animated.spring(tabScale, { toValue: 0.85, useNativeDriver: true, friction: 8 }),
        Animated.spring(tabScale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={styles.tabItem}
        activeOpacity={1}
      >
        <Animated.View style={{ transform: [{ scale: tabScale }], alignItems: "center" }}>
          <View style={[
            styles.tabIconWrap,
            isFocused && { backgroundColor: PURPLE_LIGHT },
          ]}>
            {options.tabBarIcon?.({ color: isFocused ? PURPLE : "#9CA3AF", size: 22 })}
          </View>
          <Text style={[
            styles.tabLabel,
            { color: isFocused ? PURPLE : "#9CA3AF", fontFamily: isFocused ? "Inter_700Bold" : "Inter_500Medium" },
          ]}>
            {label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {fabOpen && (
        <Pressable onPress={closeFab} style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[styles.overlay, { opacity: overlayAnim }]}
            pointerEvents={fabOpen ? "auto" : "none"}
          />
        </Pressable>
      )}

      {/* FAB sub-actions */}
      {FAB_ACTIONS.map((action, i) => {
        const angle = -90 + (i - 1) * 52;
        const rad = (angle * Math.PI) / 180;
        const dist = 92;
        const tx = fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * dist] });
        const ty = fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * dist] });
        const sc = fabAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.75, 1] });
        const op = fabAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] });

        return (
          <Animated.View
            key={action.label}
            style={[styles.fabAction, { bottom: bottomPad + 54, transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }], opacity: op }]}
          >
            <TouchableOpacity
              onPress={() => handleFabAction(action.route)}
              style={[styles.fabActionBtn, { backgroundColor: action.color }, shadow("#000", 10, 5, 0.2)]}
              activeOpacity={0.85}
            >
              <Feather name={action.icon} size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.fabActionLabel}>{action.label}</Text>
          </Animated.View>
        );
      })}

      {/* Main tab bar */}
      <View style={[styles.container, { paddingBottom: bottomPad }]}>
        <View style={[styles.pill, shadow("#7C3AED", 28, 10, 0.14)]}>
          <View style={styles.tabGroup}>
            {leftRoutes.map((item: any) => renderTab(item))}
          </View>

          {/* Center FAB */}
          <View style={styles.fabWrap}>
            <TouchableOpacity
              onPress={toggleFab}
              activeOpacity={0.9}
              style={[styles.fab, shadow(PURPLE, 14, 6, 0.5)]}
            >
              <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
                <Feather name="plus" size={26} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <View style={styles.tabGroup}>
            {rightRoutes.map((item: any) => renderTab(item))}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    alignItems: "center", paddingHorizontal: 16,
  },
  pill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 44,
    paddingHorizontal: 8, paddingVertical: 8,
    width: "100%", maxWidth: 420,
  },
  tabGroup: { flex: 1, flexDirection: "row" },
  tabItem: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 8, gap: 4,
  },
  tabIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  tabLabel: { fontSize: 11 },
  fabWrap: { alignItems: "center", justifyContent: "center", marginHorizontal: 6 },
  fab: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: PURPLE,
    alignItems: "center", justifyContent: "center",
    marginTop: -22,
  },
  fabAction: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    left: "50%",
    marginLeft: -24,
  },
  fabActionBtn: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: "center", justifyContent: "center",
  },
  fabActionLabel: {
    marginTop: 5, fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(14,10,35,0.4)",
  },
});
