import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    alert: false,
    alertContent: '成功',
    alertType: 'success',
    alertColor: 'primary',
    coupondialog: false
  },
  mutations: {
    setAlert (state, payload) {
      state.alert = payload.alert
      state.alertContent = payload.alertContent
      state.alertType = payload.alertType
      state.alertColor = payload.alertColor
    }
  },
  actions: {
    setAlert ({ commit }, payload) {
      commit('setAlert', payload)
      setTimeout(() => {
        this.state.alert = false
      }, 1500)
    }
  }
})
