import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { FormLabel, useTheme } from "src/ui";
import { PlusIcon } from "assets";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "src/config/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

export const WIDTH = 360;

const EditProfileImage = ({
  image,
  setImage,
  uploading,
  setUploading,
  imagePath,
}) => {
  const [progress, setProgress] = React.useState(0);

  const { colors } = useTheme();

  async function uploadImage(uri: string) {
    setUploading(true);
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, imagePath);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot?.bytesTransferred / snapshot?.totalBytes) * 100;
        setProgress(progress.toFixed());
      },
      (error) => {
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask?.snapshot?.ref).then(async (downloadUrl) => {
          setImage(downloadUrl);
          setUploading(false);
        });
      }
    );
  }

  const resizeImage = async (image) => {
    return await ImageManipulator.manipulateAsync(
      image?.localUri || image.uri,
      [{ resize: { width: WIDTH, height: WIDTH } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    const resizedImage = await resizeImage(result?.assets?.[0]);

    if (!result.canceled) {
      uploadImage(resizedImage?.uri);
      setImage(resizedImage?.uri);
    }
  };

  return (
    <View>
      <FormLabel label="Photo" />
      <TouchableOpacity
        onPress={() => {
          pickImage();
        }}
        style={{
          borderRadius: 999,
          marginBottom: 24,
        }}>
        {!image ? (
          <View
            style={{
              width: 140,
              height: 140,
              backgroundColor: "#rgb(230,230,230)",
              alignSelf: "center",
              borderRadius: 999,
            }}>
            <View
              style={{
                width: 24,
                height: 24,
                marginLeft: 106,
                marginTop: 106,
                borderRadius: 999,
              }}>
              <PlusIcon />
            </View>
          </View>
        ) : (
          <ImageBackground
            imageStyle={{
              borderRadius: 999,
              backgroundColor: "#rgb(230,230,230)",
            }}
            style={{
              width: 140,
              height: 140,
              alignSelf: "center",
            }}
            source={{ uri: image }}>
            <View
              style={{
                width: 24,
                height: 24,
                marginLeft: 106,
                marginTop: 106,
                borderRadius: 999,
              }}>
              <PlusIcon />
            </View>
          </ImageBackground>
        )}

        {uploading ? (
          <View
            style={{
              position: "absolute",
              alignSelf: "center",
              alignItems: "center",
              justifyContent: "center",
              width: 140,
              height: 140,
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}>
            <ActivityIndicator size={"small"} color={"white"} />
            <Text
              style={{ color: "white", marginTop: 2 }}>{`${progress}%`}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          marginBottom: 8,
          alignSelf: "center",
          padding: 4,
          borderRadius: 4,
          backgroundColor: colors.lightRed,
          borderColor: colors.red,
          borderWidth: 1,
        }}
        onPress={() => {
          setImage(null);
        }}>
        <Text style={{ color: colors?.red }}>Remove Photo</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditProfileImage;
