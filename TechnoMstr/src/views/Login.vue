<template>
    <div class="login-page">
        <div class="login-section">
            <div class="logo">
                <img src="../assets/technocodelogo.png" alt="Logo">
            </div>
            <div class="login-container">
                <form @submit.prevent="handleSubmit" class="login-form-container">
                    <FormInput
                        id="username"
                        label="NOM D'UTILISATEUR"
                        type="text"
                        :icon-src="'https://cdn.builder.io/api/v1/image/assets/11ca9f5aa3e84ca99e47336ecb81adba/57c615065e7588efe8142e4aa4b035def68b598d6c0de255ad7a6478d883cb5d?placeholderIfAbsent=true'"
                        v-model="username"
                        required
                    />
                    <FormInput
                        id="password"
                        label="MOT DE PASSE"
                        type="password"
                        :icon-src="'https://cdn.builder.io/api/v1/image/assets/11ca9f5aa3e84ca99e47336ecb81adba/bcf115377daebb36ffec05544b8347b5f0a7d3cc8a63a28e5329761bb4156f71?placeholderIfAbsent=true'"
                        v-model="password"
                        class="password-input"
                        required
                    />
                    <div v-if="error" class="error-message">{{ error }}</div>
                    <button type="submit" class="login-button">
                        <LoginButton />
                    </button>
                    <ForgotPassword @click="handleForgotPassword" />
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import FormInput from "../components/LoginComponents/FormInput.vue";
import LoginButton from "../components/LoginComponents/LoginButton.vue";
import ForgotPassword from "../components/LoginComponents/ForgotPassword.vue";

const router = useRouter();
const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const error = ref('');

// Check if user is already authenticated
onMounted(async () => {
    if (authStore.isAuthenticated) {
        router.push('/dashboard');
    }
});

const handleSubmit = async () => {
    try {
        error.value = ''; // Clear any previous errors
        
        if (!username.value || !password.value) {
            error.value = 'Veuillez remplir tous les champs';
            return;
        }

        console.log('Tentative de connexion avec:', { username: username.value });
        
        const success = await authStore.login({
            username: username.value,
            password: password.value
        });
        
        console.log('Résultat de la connexion:', success);
        
        if (success) {
            console.log('Connexion réussie, redirection vers le dashboard');
            router.push('/dashboard');
        } else {
            error.value = 'Identifiants invalides';
        }
    } catch (err) {
        console.error('Erreur de connexion:', err);
        error.value = 'Une erreur est survenue lors de la connexion';
    }
};

const handleForgotPassword = () => {
    console.log("Mot de passe oublié cliqué");
};
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--dark);
}

.login-section {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
}

.logo {
    margin-bottom: 2rem;
}

.logo img {
    max-width: 200px;
    height: auto;
}

.login-container {
    width: 100%;
}

.login-form-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.password-input {
    margin-top: 1rem;
}

.error-message {
    color: #ff4444;
    text-align: center;
    margin-bottom: 1rem;
}

.login-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    width: 100%;
}
</style>
  