
import { ref, computed } from 'vue';
import axios from 'axios';

export function useImageUpload() {
  const imageUrl = ref<string | null>(null);
  const imageIsLoading = ref(false); // Sert à afficher  / cacher un "loader"
  const imageUrlFilled = computed(() => imageUrl.value); // Sert à modifier le display de l'input file en fonction de la nouvelle image


  const uploadImage = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    imageIsLoading.value = true; // Activation du statut "loading"
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/books/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      imageUrl.value = response.data.url;
      console.log("Image uploaded successfully:", response.data.url);
    } catch (error) {
       imageUrl.value = "error";
      console.error("Image upload failed:", error);
    }

    imageIsLoading.value = false;

  };

  return { imageUrl, imageIsLoading, imageUrlFilled, uploadImage };
}
