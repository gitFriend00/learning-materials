<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

async function handleSubmit() {
  const ok = await auth.login(email.value, password.value)
  if (ok) {
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  }
}
</script>

<template>
  <div class="login-stage">
    <v-card class="login-card" elevation="6" rounded="xl">
      <div class="login-header">
        <span class="login-emoji">🍎</span>
        <h1 class="login-title">Teacher Sherly's Class</h1>
        <p class="login-sub">Sign in to open your sticker jars</p>
      </div>

      <v-form @submit.prevent="handleSubmit">
        <!-- 
          DUMMY HIDDEN INPUTS: 
          Chrome and Edge will force their password manager onto the first 
          text/password inputs they find. These dummy fields catch the autofill 
          so your visible Vuetify fields stay clean and empty.
        -->
        <input type="text" name="fake-username" class="hidden-dummy" autocomplete="username" tabindex="-1" />
        <input type="password" name="fake-password" class="hidden-dummy" autocomplete="current-password" tabindex="-1" />

        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          variant="outlined"
          autocomplete="off"
          :disabled="auth.loading"
          required
        />
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          autocomplete="new-password"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :disabled="auth.loading"
          required
          @click:append-inner="showPassword = !showPassword"
        />

        <v-alert
          v-if="auth.error"
          type="error"
          variant="tonal"
          density="compact"
          class="login-error"
        >
          {{ auth.error }}
        </v-alert>

        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          rounded="lg"
          :loading="auth.loading"
        >
          Sign In
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<style scoped>
.login-stage {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #fef6e4 0%, #eaf6ff 100%);
  padding: 24px;
}
.login-card {
  width: 100%;
  max-width: 380px;
  padding: 32px 28px;
}
.login-header {
  text-align: center;
  margin-bottom: 20px;
}
.login-emoji {
  font-size: 42px;
  display: block;
  margin-bottom: 4px;
}
.login-title {
  font-size: 22px;
  margin: 0 0 4px;
  color: #3a3a3a;
}
.login-sub {
  margin: 0;
  color: #777;
  font-size: 14px;
}
.login-error {
  margin: 4px 0 16px;
}

/* Hides the dummy inputs completely from the UI, but keeps them in the DOM */
.hidden-dummy {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

/* Keep the autofill background clean just in case */
:deep(input:-webkit-autofill) {
  -webkit-text-fill-color: #1a1a1a;
  box-shadow: 0 0 0px 1000px #fff inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>