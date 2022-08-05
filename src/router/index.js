import Vue from 'vue'
import VueRouter from 'vue-router'

import Soya from '../views/Soya.vue'
import Cania from '../views/Cania.vue'
import Palma from '../views/Palma.vue'

import Sancionadas from '../views/Sancionadas.vue'

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
    {
      path: '/sancionadas',
      name: 'sancionadas',
      component: Sancionadas
    },
    {
      path: '/palma',
      name: 'palma',
      component: Palma
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
  })
  
  export default router