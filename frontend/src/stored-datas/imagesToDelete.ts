import { defineStore } from 'pinia';
import { ref } from 'vue';

const imagesToDeleteFromCloud = defineStore("imagesToDeleteFromCloud", () => {
    const imagesArray = ref<(string | null)[]>([]);
    return {
        imagesArray
    }
});

export default imagesToDeleteFromCloud;