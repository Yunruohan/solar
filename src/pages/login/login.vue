<template>
  <v-app class="login">
    <v-card>
      <h1 class="logo animation">qfpay</h1>
      <v-card-text>
        <v-form>
          <v-text-field prepend-icon="person" label="username" v-model="username"></v-text-field>
          <v-text-field prepend-icon="lock" label="password" type="password" v-model="password"></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="login()" color="secondary">确认</v-btn>
      </v-card-actions>
    </v-card>
    <v-btn class="invert_colors_button" flat icon color="white" @click="test()">
      <v-icon>invert_colors</v-icon>
    </v-btn>
    <v-snackbar v-model="showSnackbar" :timeout="4000" top>{{snackbarText}}</v-snackbar>
    <div id="particles" :style="'background-color:' + color"></div>
  </v-app>
</template>

<script>
import qs from 'qs'
import 'particles.js/particles'
const particlesJS = window.particlesJS
export default {
  name: 'Login',
  data () {
    return {
      username: '14000000000',
      password: 'qfpay123456',
      snackbarText: '',
      showSnackbar: false,
      color: ''
    }
  },
  created() {

  },
  mounted () {
    particlesJS.load('particles', 'snowflakes.json')
  },
  methods: {
    test () {
      this.color = this.color ? '' : '#444444'
    },
    login () {
      this.$http({
        url: '/solar/v1/user/login',
        method: 'POST',
        data: qs.stringify({
          username: this.username,
          password: this.password
        })
      }).then(response => {
        let res = response.data
        if (res.respcd === '0000') {
          window.location.replace('/#/orgManage')
        } else {
          this.snackbarText = res.resperr
          this.showSnackbar = true
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.login {
  overflow: hidden;
}
.invert_colors_button {
  position: absolute;
  z-index: 100;
  right: 10px;
  top: 10px;
}
.invert_colors_button:hover, .invert_colors_button:focus{
  position: absolute;
}
#particles {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 10;
  top: 0;
  left: 0;
  background-color: #00B3E3;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
}
.v-card__text {
  border-radius: 4px;
  background-color: rgba(255,255,255,0.8);
}
.theme--light.v-card {
  background-color: transparent;
  box-shadow: none;
}
.v-card {
  position: absolute;
  z-index: 100;
  width: 480px;
  margin-left: -240px;
  left: 50%;
  top: 20%;
}
input:-webkit-autofill {
  background-color: #fff;
}
.logo {
  width: 198px;
  height: 42px;
  overflow: hidden;
  margin-bottom: 30px;
  color: transparent;
  background: #fff url('assets/qfpay.svg') -1px -1px no-repeat;
  background-size: 102% auto;
}
@keyframes changecolor {
  from {
    background-color: #fff;
  }

  to {
    background-color: rgb(0, 179, 227);
  }
}
.animation {
  animation-duration: 2s;
  animation-name: changecolor;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
</style>
