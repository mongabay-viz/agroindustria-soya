<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
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
      :margen="{'arriba': 40, 'abajo': 20, 'izquierda': 50, 'derecha': 20}"
      :nombre_barra="'anio'"
      :nombre_color="'nombre_colores'"
      :alto_vis="400"
      :espaciado_barras=".2"
      ref="mi_serie_temporal"
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
  @font-face {
  font-family: "hiragino-kaku-gothic";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("~@/assets/fonts/Heisei Kaku Gothic Std W3.otf");
}
@font-face {
  font-family: "hiragino-kaku-gothic";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("~@/assets/fonts/Heisei Kaku Gothic Std W5.otf");
}

#app {
  font-family: "hiragino-kaku-gothic";
  color: #000;

}
</style>
