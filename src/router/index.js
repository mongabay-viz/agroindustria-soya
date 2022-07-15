import Vue from 'vue'
import VueRouter from 'vue-router'

import Soya from '../views/Soya.vue'
import Cania from '../views/Cania.vue'

Vue.use(VueRouter)


const routes = [
    {
      path: '/soya',
      name: 'soya',
      component: Soya
    },
    {
      path: '/cania',
      name: 'cania',
      component: Cania
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
  })
  
  export default router