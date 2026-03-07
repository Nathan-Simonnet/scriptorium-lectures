import { defineStore } from "pinia";
import { ref } from 'vue'

const userSates = defineStore("userSate", () => {

    const currentUserId = ref(sessionStorage.getItem("userId"));
    const isUserConnected = ref(currentUserId.value === null ? false : true);

    const logUserStates = () => {
        return isUserConnected.value;
    };

    const changeUserStates = () => {
        isUserConnected.value = !isUserConnected.value;
    };

    const changeUserId = (newUserId: string | null) => {
        currentUserId.value = newUserId;
    };

    const logUserId = () => {
        return currentUserId.value;
    };
    return {
        isUserConnected,
        currentUserId,
        logUserStates,
        changeUserStates,
        changeUserId,
        logUserId
    };
});

export default userSates;