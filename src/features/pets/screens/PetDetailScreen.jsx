import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import AppSnackbar from "@/src/shared/components/ui/Snackbar/AppSnackbar";
import MapView, { Marker } from "react-native-maps";
import { useQueryClient } from "@tanstack/react-query";

import AboutText from "@/src/features/pets/Components/PetDetails/AboutText";
import PetChips from "@/src/features/pets/Components/PetDetails/PetChips";
import PetHeader from "@/src/features/pets/Components/PetDetails/PetHeader";
import PostedByCard from "@/src/features/pets/Components/PetDetails/PostedByCard";
import StatCards from "@/src/features/pets/Components/PetDetails/StatCards";
import AdoptionBottomSheet from "@/src/features/pets/Components/AdoptionBottomSheet";
import { deletePet, reopenPet, setAdopted } from "@/src/features/pets/services/petService";
import { deleteRequestsForPet } from "@/src/features/pets/services/adoptionService";
import { useMyAdoptionRequest, useSendAdoptionRequest } from "@/src/features/pets/hooks/useAdoptionRequest";
import { getReadableAddress } from "@/src/features/home/utils/distance";
import { formatTimeAgo } from "@/src/features/home/utils/timeAgo";
import { usePet } from "@/src/features/home/hooks/usePets";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { supabase } from "@/src/shared/services/supabase/client";
import { deleteImage } from "@/src/shared/services/supabase/upload";
import { getOrCreateChat } from "@/src/features/chats/services/chatService";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";
import LoadingModal from "@/src/shared/components/ui/LoadingModal/LoadingModal";
import PawLoader from "@/src/shared/components/ui/PawLoader/PawLoader";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PetDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { petId } = useLocalSearchParams();
  const { t } = useTranslationLoader("petdetails");
  const queryClient = useQueryClient();

  const [userId, setUserId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [readableAddress, setReadableAddress] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdoptSheet, setShowAdoptSheet] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: pet, isLoading, error } = usePet(petId);
  const { data: myRequest } = useMyAdoptionRequest(petId, userId);
  const { mutate: sendRequest, isPending: sendingRequest } = useSendAdoptionRequest(petId, userId);

  useEffect(() => {
    if (pet?.lat != null) {
      getReadableAddress(pet.lat, pet.lng).then(setReadableAddress);
    }
  }, [pet]);

  const handleSendRequest = (note) => {
    sendRequest(note, {
      onSuccess: () => {
        setShowAdoptSheet(false);
        setSnackbarMsg(t("requestSentSuccess"));
        setSnackbarVisible(true);
      },
      onError: (err) => {
        Alert.alert(t("error"), err.message || t("requestError"));
      },
    });
  };

  const handleMarkAsAdopted = () => {
    setMenuVisible(false);
    Alert.alert(t("confirmAdoptTitle"), t("confirmAdoptMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirm"),
        onPress: async () => {
          try {
            setLoading(true);
            await setAdopted(petId);
            await queryClient.invalidateQueries({ queryKey: ["pet", petId] });
            await queryClient.invalidateQueries({ queryKey: ["pets"] });
            setSnackbarMsg(t("adoptedSuccess"));
            setSnackbarVisible(true);
          } catch {
            Alert.alert(t("adoptErrorTitle"), t("adoptErrorMessage"));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleReopenPet = () => {
    setMenuVisible(false);
    Alert.alert(t("confirmReopenTitle"), t("confirmReopenMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirm"),
        onPress: async () => {
          try {
            setLoading(true);
            await deleteRequestsForPet(petId);
            await reopenPet(petId);
            await queryClient.invalidateQueries({ queryKey: ["pet", petId] });
            await queryClient.invalidateQueries({ queryKey: ["pets"] });
            await queryClient.invalidateQueries({ queryKey: ["userPets"] });
            setSnackbarMsg(t("reopenSuccess"));
            setSnackbarVisible(true);
          } catch {
            Alert.alert(t("reopenErrorTitle"), t("reopenErrorMessage"));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeletePet = () => {
    setMenuVisible(false);
    Alert.alert(t("confirmDeleteTitle"), t("confirmDeleteMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const imagePaths = (pet?.images ?? [])
              .map((url) => {
                const match = url.match(/\/object\/sign\/([^/]+)\/(.+)\?/);
                return match ? { bucket: match[1], path: match[2] } : null;
              })
              .filter(Boolean);
            await deletePet(petId);
            await Promise.all(imagePaths.map(({ bucket, path }) => deleteImage(bucket, path)));
            router.back();
          } catch {
            Alert.alert(t("deleteErrorTitle"), t("deleteErrorMessage"));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleOpenChat = async () => {
    if (!userId || !pet?.posted_by) return;
    try {
      const chatId = await getOrCreateChat(userId, pet.posted_by, petId);
      router.push({
        pathname: "/(tabs)/chats/[chatId]",
        params: { chatId, title: poster?.name ?? t("chatWithOwner") },
      });
    } catch {
      Alert.alert(t("error"), t("chatError"));
    }
  };

  const renderCTA = () => {
    if (isOwner) return null;

    if (myRequest?.status === "pending") {
      return (
        <View style={styles.ctaWrapper}>
          <View style={styles.pendingButton}>
            <Ionicons name="hourglass-outline" size={16} color="#FF6B6B" />
            <Text style={styles.pendingButtonText}>{t("requestPending")}</Text>
          </View>
          <View style={styles.ctaSubtitleRow}>
            <Ionicons name="time-outline" size={13} color="#4D9DE0" />
            <Text style={styles.ctaSubtitleText}>{t("waitingOwnerResponse")}</Text>
          </View>
        </View>
      );
    }

    if (myRequest?.status === "accepted") {
      return (
        <View style={styles.ctaWrapper}>
          <View style={[styles.statusButton, { backgroundColor: "#22C55E" }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.statusButtonText}>{t("requestAccepted")}</Text>
          </View>
        </View>
      );
    }

    if (myRequest?.status === "declined") {
      return (
        <View style={styles.ctaWrapper}>
          <View style={[styles.statusButton, { backgroundColor: theme.colors.error }]}>
            <Ionicons name="close-circle-outline" size={20} color="#fff" />
            <Text style={styles.statusButtonText}>{t("requestDeclined")}</Text>
          </View>
          {myRequest.owner_note ? (
            <Text style={[styles.ctaSubtitleText, { color: theme.colors.error, marginTop: 6 }]}>
              {myRequest.owner_note}
            </Text>
          ) : null}
        </View>
      );
    }

    if (pet.status === "adopted") {
      return (
        <AppButton
          text={t("alreadyAdopted")}
          disabled
          style={styles.adoptButton}
          onPress={() => {}}
        />
      );
    }

    return (
      <AppButton
        text={t("adoptMe")}
        onPress={() => setShowAdoptSheet(true)}
        style={styles.adoptButton}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <PawLoader text={t("loading")} />
      </View>
    );
  }
  if (error || !pet) {
    return <Text style={{ padding: 16, color: theme.colors.error }}>{t("error")}</Text>;
  }

  const isOwner = userId && pet.posted_by === userId;
  const poster = pet.profiles;
  const isDark = theme.dark;
  const menuBg = isDark ? theme.colors.palette.neutral[800] : "#FFFFFF";
  const menuTextColor = theme.colors.onSurface;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <AppSnackbar
        visible={snackbarVisible}
        message={snackbarMsg}
        onDismiss={() => setSnackbarVisible(false)}
        type="success"
      />
      <LoadingModal loading={loading} />
      <ScrollView
        style={{ backgroundColor: theme.colors.surface }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >

      {/* Hero image carousel */}
      <View style={styles.heroContainer}>
        <Pressable onPress={() => router.back()} style={styles.backIcon}>
          <View style={styles.backIconWrapper}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.palette.blue[500]} />
          </View>
        </Pressable>

        {isOwner && (
          <Pressable onPress={() => setMenuVisible(true)} style={styles.menuIcon}>
            <View style={styles.menuButton}>
              <Ionicons name="ellipsis-vertical" size={22} color={theme.colors.palette.blue[500]} />
            </View>
          </Pressable>
        )}

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            if (idx !== activeIndex) setActiveIndex(idx);
          }}
          scrollEventThrottle={16}
        >
          {(pet.images ?? []).map((img, index) => (
            <Pressable
              key={index}
              onPress={() => { setActiveIndex(index); setIsModalVisible(true); }}
            >
              <Image source={{ uri: img }} style={styles.carouselImage} resizeMode="cover" />
            </Pressable>
          ))}
        </ScrollView>

        {(pet.images?.length ?? 0) > 1 && (
          <View style={styles.carouselIndicators}>
            {pet.images.map((_, index) => (
              <View key={index} style={[styles.dot, index === activeIndex && styles.activeDot]} />
            ))}
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <PetHeader name={pet.name} colors={pet.color ?? []} adopted={pet.status === "adopted"}>
          <PetChips
            gender={pet.gender}
            breed={pet.breed}
            vaccinated={pet.vaccinated}
            sterilized={pet.sterilized}
            dewormed={pet.dewormed}
            hasPassport={pet.has_passport}
            specialNeeds={pet.special_needs}
          />
        </PetHeader>

        <StatCards size={pet.size} ageValue={pet.age_value} ageUnit={pet.age_unit} activity={pet.activity_level} />

        {poster && (
          <PostedByCard
            name={poster.name ?? "Unknown"}
            avatarUrl={poster.avatar_url}
            postedAt={formatTimeAgo(pet.created_at, t)}
            onMessage={!isOwner ? handleOpenChat : undefined}
          />
        )}

        <AboutText description={pet.description || t("noDescription")} />

        {/* Ask Pawlo about this pet */}
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => router.push({ pathname: "/(tabs)/chats/pawlo", params: { petId, _source: "external" } })}
          style={[
            styles.pawloCard,
            {
              backgroundColor: isDark ? theme.colors.palette.blue[900] : theme.colors.palette.blue[100],
              borderColor: isDark ? theme.colors.palette.blue[700] : theme.colors.palette.blue[200],
            },
          ]}
        >
          {/* Decorative background paw */}
          <Text style={styles.pawloBgDecor}>🐾</Text>

          {/* Avatar */}
          <View style={[styles.pawloAvatar, { backgroundColor: theme.colors.palette.blue[500] }]}>
            <Ionicons name="paw" size={22} color="#fff" />
          </View>

          {/* Text */}
          <View style={styles.pawloTextArea}>
            <Text style={[styles.pawloTitle, { color: isDark ? theme.colors.palette.blue[100] : theme.colors.palette.blue[800] }]}>
              Ask Pawlo about {pet.name}
            </Text>
            <Text style={[styles.pawloSubtitle, { color: isDark ? theme.colors.palette.blue[300] : theme.colors.palette.blue[600] }]}>
              AI-powered pet advice, just for you
            </Text>
          </View>

          {/* Arrow pill */}
          <View style={[styles.pawloArrow, { backgroundColor: theme.colors.palette.blue[500] }]}>
            <Ionicons name="chevron-forward" size={15} color="#fff" />
          </View>
        </TouchableOpacity>

        {pet.lat != null && (
          <View style={styles.section}>
            <Text variant="headlineMedium" style={styles.sectionTitle}>{t("locationTitle")}</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: pet.lat,
                longitude: pet.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={{ latitude: pet.lat, longitude: pet.lng }}
                title={pet.name}
                description={readableAddress}
              />
            </MapView>
            <View style={styles.locationInfoRow}>
              <Ionicons name="location-outline" size={18} color="#6c757d" style={{ marginRight: 6 }} />
              <Text style={styles.locationText}>{readableAddress}</Text>
            </View>
          </View>
        )}

        {renderCTA()}
      </View>

      {/* Fullscreen image modal */}
      <Modal visible={isModalVisible} transparent>
        <View style={styles.modalContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
            }}
            contentOffset={{ x: SCREEN_WIDTH * activeIndex, y: 0 }}
          >
            {(pet.images ?? []).map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          <Pressable style={styles.modalClose} onPress={() => setIsModalVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
        </View>
      </Modal>

      {/* Custom owner menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuVisible(false)} />
        <View style={[styles.customMenu, { backgroundColor: menuBg }]}>
          {pet.status === "adopted" ? (
            <TouchableOpacity style={styles.menuRow} onPress={handleReopenPet} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={20} color={menuTextColor} />
              <Text style={[styles.menuRowText, { color: menuTextColor }]}>
                {t("reopenPet")}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.menuRow} onPress={handleMarkAsAdopted} activeOpacity={0.7}>
              <Ionicons name="checkmark-done-outline" size={20} color={menuTextColor} />
              <Text style={[styles.menuRowText, { color: menuTextColor }]}>
                {t("confirmAdoptTitle")}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => { setMenuVisible(false); router.push(`/addPet/${petId}`); }}
          >
            <Ionicons name="create-outline" size={20} color={menuTextColor} />
            <Text style={[styles.menuRowText, { color: menuTextColor }]}>
              Edit Pet Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={handleDeletePet} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={20} color="#AF2E2E" />
            <Text style={[styles.menuRowText, { color: "#AF2E2E" }]}>
              {t("delete")}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <AdoptionBottomSheet
        visible={showAdoptSheet}
        onClose={() => setShowAdoptSheet(false)}
        onSubmit={handleSendRequest}
        loading={sendingRequest}
      />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    position: "relative",
    width: "100%",
    height: 350,
    overflow: "hidden",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: "lightgray",
  },
  carouselImage: { width: SCREEN_WIDTH, height: 350 },
  backIcon: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  backIconWrapper: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  menuIcon: { position: "absolute", top: 50, right: 20, zIndex: 10 },
  menuButton: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  carouselIndicators: {
    position: "absolute",
    bottom: 16,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.5)", marginHorizontal: 4 },
  activeDot: { backgroundColor: "#fff" },
  content: { padding: 16 },
  section: { marginTop: 24, marginBottom: 16 },
  sectionTitle: { marginBottom: 8 },
  map: { width: "100%", height: 200, borderRadius: 12, marginBottom: 8, overflow: "hidden" },
  locationInfoRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  locationText: { fontSize: 14, color: "#6c757d", flexShrink: 1 },
  adoptButton: { marginTop: 24, alignSelf: "center" },
  pawloCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 20,
    overflow: "hidden",
    shadowColor: "#4D9DE0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  pawloBgDecor: {
    position: "absolute",
    right: 48,
    top: -8,
    fontSize: 72,
    opacity: 0.07,
  },
  pawloAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pawloTextArea: {
    flex: 1,
    gap: 3,
  },
  pawloTitle: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 14,
    lineHeight: 20,
  },
  pawloSubtitle: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  pawloArrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaWrapper: { marginTop: 24, gap: 8 },
  pendingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFE1E1",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  pendingButtonText: {
    fontFamily: "Alexandria_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    color: "#FF6B6B",
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  statusButtonText: {
    fontFamily: "Alexandria_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    color: "#fff",
  },
  ctaSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  ctaSubtitleText: {
    fontFamily: "Alexandria_300Light",
    fontSize: 14,
    lineHeight: 20,
    color: "#4D9DE0",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: { position: "absolute", top: 40, right: 20, zIndex: 20, padding: 8 },
  fullscreenImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  customMenu: {
    position: "absolute",
    top: 108,
    right: 16,
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 180,
  },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 8 },
  menuRowText: { fontFamily: "Alexandria_600SemiBold", fontSize: 14, lineHeight: 20 },
});
