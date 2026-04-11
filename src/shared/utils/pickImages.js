import * as ImagePicker from "expo-image-picker";

export const pickOneImage = async () => {
  try {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return null;

    return result.assets[0].uri; 
  } catch (error) {
    console.error("Error picking image:", error);
    return null;
  }
};

export const pickMultipleImages = async () => {
  try {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      allowsEditing: false, 
      quality: 1,
      selectionLimit: 8,
    });

    if (result.canceled) return [];

    return result.assets.map((asset) => asset.uri);
  } catch (error) {
    console.error("Error picking images:", error);
    return [];
  }
};
