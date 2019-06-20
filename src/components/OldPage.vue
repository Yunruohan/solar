<template>
  <iframe :src="currentPage" style="border:none" width="100%" height="100%"></iframe>
</template>

<script>
const host = process.env.NODE_ENV === 'development' ? 'https://oms.qa.qfpay.net' : window.location.origin
export default {
  data () {
    return {
      currentPage: ''
    }
  },
  watch: {
    '$route' (to, from) {
      const host = process.env.NODE_ENV === 'development' ? 'https://oms.qa.qfpay.net' : window.location.origin
      this.currentPage = `${host}${to.path}?hide=yes`
    }
  },
  created () {
    this.currentPage = `${host}${this.$route.path}?hide=yes`
  }
}
</script>
