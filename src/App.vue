<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <Mapa 
      :id='"mapa"'
      :geojson="geojson"
    />
    <Serie
      :barras_id='"serie"'
      :datos="data_series"
      :variables="[
        { id: 'cultivo', nombre_colores: 'cultivo', color: 'green'},
      ]"
      :nombre_barra="'anio'"
      :nombre_color="'nombre_colores'"
      titulo_eje_y="cultivo"
      titulo_eje_x="Año"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import Mapa from './components/Mapa.vue'
import Serie from './components/Serie.vue'


export default {
  name: 'App',
  components: {
    Mapa,
    Serie
  },
  data(){
    return {
      geojson: Object,
      data_series:[]
    }
  },
  beforeMount(){
    this.geojson = this.$store.state.datos;
  },
  computed: {
    ...mapState(["base_serie"])
  },
  watch: {
    base_serie(nv){
      this.data_series = nv;
    },
  }

}
</script>

<style lang="scss">
#app {
  margin-left: 40px;
  display: flex;
}
</style>
