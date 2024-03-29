import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    showSnackbar: false,
    snackbarText: '',
    snackbarColor: ''
  },
  mutations: {
    setSnackbar (state, payload) {
      state.showSnackbar = payload.showSnackbar
      state.snackbarText = payload.snackbarText
      state.snackbarColor = payload.snackbarColor
    }
  },
  actions: {
    setSnackbar ({ commit }, payload) {
      commit('setSnackbar', payload)
    }
  }
})
