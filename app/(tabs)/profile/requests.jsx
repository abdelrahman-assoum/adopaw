import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  I18nManager,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useAcceptRequest,
  useCancelAdoptionRequest,
  useDeclineRequest,
  useReceivedRequests,
  useSentRequests,
} from "@/src/features/pets/hooks/useAdoptionRequest";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { supabase } from "@/src/shared/services/supabase/client";

// ─── Request Card ────────────────────────────────────────────────────────────

function RequestCard({ request, tab, userId }) {
  const theme = useTheme();
  const { t } = useTranslationLoader("profile");

  const { mutate: cancelRequest, isPending: cancelling } = useCancelAdoptionRequest(
    request.pet?.id,
    userId
  );
  const { mutate: acceptRequest, isPending: accepting } = useAcceptRequest(userId);
  const { mutate: declineRequest, isPending: declining } = useDeclineRequest(userId);

  const pet = request.pet;
  const personName = tab === "sent" ? pet?.owner?.name : request.requester?.name;
  const personAvatar = tab === "sent" ? pet?.owner?.avatar_url : request.requester?.avatar_url;
  const imageUri = Array.isArray(pet?.images) ? pet.images[0] : pet?.images ?? null;

  const isMale = pet?.gender?.toLowerCase() === "male";
  const genderColor = isMale
    ? theme.colors.palette.blue[500]
    : theme.colors.palette.coral[500];
  const genderIcon = isMale ? "male" : "female";

  const handleCancel = () => {
    Alert.alert(t("requests.cancelConfirmTitle"), t("requests.cancelConfirmMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("requests.cancel"), style: "destructive", onPress: () => cancelRequest(request.id) },
    ]);
  };

  const handleDecline = () => {
    Alert.alert(t("requests.declineConfirmTitle"), t("requests.declineConfirmMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("requests.decline"), style: "destructive", onPress: () => declineRequest(request.id) },
    ]);
  };

  const statusConfig = {
    pending:  { bg: "#FFF6E8", text: "#E8941A", icon: "time-outline" },
    accepted: { bg: "#BCE8D3", text: "#2D9B66", icon: "checkmark-circle-outline" },
    declined: { bg: "#F6D7D7", text: "#AF2E2E", icon: "close-circle-outline" },
  };
  const statusStyle = statusConfig[request.status] ?? statusConfig.pending;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {/* Pet image */}
      <View style={styles.cardImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.imageFallback]}>
            <Ionicons name="paw" size={24} color={theme.colors.palette.neutral[300]} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.petName, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {pet?.name ?? "—"}
          </Text>
          <MaterialIcons name={genderIcon} size={16} color={genderColor} />
        </View>

        <View style={styles.chipsRow}>
          {pet?.age_value != null && (
            <View style={[styles.chip, { backgroundColor: "#DBEBF9" }]}>
              <Ionicons name="time-outline" size={10} color="#4D9DE0" />
              <Text style={[styles.chipText, { color: "#4D9DE0" }]}>
                {pet.age_value} {pet.age_unit}
              </Text>
            </View>
          )}
          {pet?.species && (
            <View style={[styles.chip, { backgroundColor: "#FFE1E1" }]}>
              <Text style={[styles.chipText, { color: "#FF6B6B" }]}>{pet.species}</Text>
            </View>
          )}
        </View>

        {personName ? (
          <View style={styles.personRow}>
            <Ionicons name="person-outline" size={12} color={theme.colors.palette.neutral[500]} />
            <Text style={[styles.personName, { color: theme.colors.palette.neutral[600] }]} numberOfLines={1}>
              {personName}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {tab === "sent" ? (
          request.status === "pending" ? (
            <TouchableOpacity style={styles.actionBtn} onPress={handleCancel} disabled={cancelling}>
              <View style={[styles.actionCircle, { backgroundColor: "#F6D7D7" }]}>
                {cancelling
                  ? <ActivityIndicator size="small" color="#AF2E2E" />
                  : <Ionicons name="close" size={16} color="#AF2E2E" />}
              </View>
              <Text style={[styles.actionLabel, { color: "#AF2E2E" }]}>{t("requests.cancel")}</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Ionicons name={statusStyle.icon} size={13} color={statusStyle.text} />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {t(`requests.${request.status}`)}
              </Text>
            </View>
          )
        ) : (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={() => {}}>
              <View style={[styles.actionCircle, { backgroundColor: "#DBEBF9" }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={15} color="#4083BB" />
              </View>
              <Text style={[styles.actionLabel, { color: "#4083BB" }]}>{t("requests.chat")}</Text>
            </TouchableOpacity>

            {request.status === "pending" ? (
              <>
                <TouchableOpacity style={styles.actionBtn} onPress={() => acceptRequest(request.id)} disabled={accepting}>
                  <View style={[styles.actionCircle, { backgroundColor: "#BCE8D3" }]}>
                    {accepting
                      ? <ActivityIndicator size="small" color="#2D9B66" />
                      : <Ionicons name="checkmark" size={16} color="#2D9B66" />}
                  </View>
                  <Text style={[styles.actionLabel, { color: "#2D9B66" }]}>{t("requests.accept")}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={handleDecline} disabled={declining}>
                  <View style={[styles.actionCircle, { backgroundColor: "#F6D7D7" }]}>
                    {declining
                      ? <ActivityIndicator size="small" color="#AF2E2E" />
                      : <Ionicons name="close" size={16} color="#AF2E2E" />}
                  </View>
                  <Text style={[styles.actionLabel, { color: "#AF2E2E" }]}>{t("requests.decline")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Ionicons name={statusStyle.icon} size={13} color={statusStyle.text} />
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {t(`requests.${request.status}`)}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function RequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslationLoader("profile");
  const isRTL = I18nManager.isRTL;

  const [tab, setTab] = useState("sent");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: sentRequests = [], isLoading: loadingSent } = useSentRequests(userId);
  const { data: receivedRequests = [], isLoading: loadingReceived } = useReceivedRequests(userId);

  const requests = tab === "sent" ? sentRequests : receivedRequests;
  const isLoading = tab === "sent" ? loadingSent : loadingReceived;

  const isDark = theme.dark;
  const bg = isDark ? theme.colors.palette.neutral[900] : "#EDF1F4";
  const tabBg = isDark ? theme.colors.palette.neutral[700] : "#C4DEF5";
  const activeTabBg = isDark ? theme.colors.palette.neutral[900] : "#FFFFFF";

  return (
    <View style={[styles.screen, { backgroundColor: bg, paddingTop: insets.top + 12 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name={isRTL ? "arrow-forward" : "arrow-back"}
          size={32}
          color={theme.colors.onSurface}
          onPress={() => router.back()}
        />
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {t("requests.title")}
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabSwitcher, { backgroundColor: tabBg }]}>
        {["sent", "received"].map((key) => {
          const isActive = tab === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.tabButton,
                isActive && [styles.tabButtonActive, { backgroundColor: activeTabBg }],
              ]}
              onPress={() => setTab(key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? "#4083BB" : "#777777" },
                  isActive && { fontFamily: "Alexandria_600SemiBold" },
                ]}
              >
                {t(`requests.${key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} color={theme.colors.primary} />
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={theme.colors.palette.neutral[300]} />
          <Text style={[styles.emptyText, { color: theme.colors.palette.neutral[500] }]}>
            {t("requests.empty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RequestCard request={item} tab={tab} userId={userId} />
          )}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontFamily: "Alexandria_600SemiBold",
    fontSize: 24,
    lineHeight: 32,
  },
  tabSwitcher: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 48,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    paddingHorizontal: 16,
  },
  tabButtonActive: {
    shadowColor: "#241915",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tabLabel: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
    flexShrink: 0,
    // top row inline — keep as a sibling
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  cardInfo: {
    flex: 1,
    gap: 6,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  petName: {
    fontFamily: "Alexandria_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 11,
    lineHeight: 15,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  personAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  personAvatarFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  personName: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    lineHeight: 17,
    flexShrink: 1,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionBtn: {
    alignItems: "center",
    gap: 4,
  },
  actionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: {
    fontFamily: "Alexandria_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
  },
});
