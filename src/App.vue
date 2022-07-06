<template>
  <div id="app">
    <p class="municipio">Municipio</p>
    <div class="controles">
      <select name="municipios" id="selector_municipal" v-model="$store.state.municipio_seleccionado">
          <option :value="municipio.id" v-for="municipio in $store.state.listado_municipios_soya" :key="municipio.id">{{municipio.nombre}}</option>
      </select>
      <button class="oculto-en-escritorio" @click="alternarVistaMovil()">
        <img src="@/assets/img/ver barras.svg" v-if="visible_movil=='mapa'" alt=""/>
        <img src="@/assets/img/ver mapa.svg" v-if="visible_movil=='grafica'" alt=""/>

      </button>
    </div>
    
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <div class="contenedor-graficos">
      <Mapa 
        :id='"mapa"'
        :geojson="geojson"
        :style="{'z-index':(visible_movil == 'mapa' ? '1' : '-1') }"
        
      />
      <Serie
        :barras_id='"serie"'
        :datos="data_series"
        :variables="[
          { id: 'cultivo', nombre_colores: 'cultivo', color: 'green'},
        ]"
        :margen="{'arriba': 40, 'abajo': 20, 'izquierda': 55, 'derecha': 20}"
        :nombre_barra="'anio'"
        :nombre_color="'nombre_colores'"
        :alto_vis="400"
        :espaciado_barras=".2"
        ref="mi_serie_temporal"
      />
    </div>
    
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
      data_series:[],
      visible_movil: "mapa"
    }
  },
  methods:{
    alternarVistaMovil(){
      if(this.visible_movil == "mapa"){
        this.visible_movil = "grafica"
      }
      else{
        this.visible_movil = "mapa"
      }
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
  max-width: 1366px;
  margin: 0 auto;
  .municipio{
    font-size: 14px;
    letter-spacing: 1.25px;
    color: #4E4D33;
    margin: 3px;
    margin-bottom: 0px;
  }
  .controles{
    @media (max-width: 768px) {
      display: flex;
    }
    .oculto-en-escritorio{
      display: none;
      @media (max-width: 768px) {
        display: inline-block;
        border: none;
        padding: 0;
        background: none;
      }
    }
    #selector_municipal {
      width: 46%;
       @media (max-width: 768px) {
        width: 100%;
      }

      height: 36px;
      margin-top: 5px;
      padding-left: 16px;
      border-color:#4E4D33;
      border-radius: 5px;
      text-transform: uppercase;
      letter-spacing: 0px;
      color: #4E4D33;
      font-size: 14px;
      font-weight: bold;
      opacity: 1;
    }
  }
  .contenedor-graficos{
    display: flex;
      @media (max-width: 768px) {
      //position: absolute;
      display: block;
      width: 100%;
    }
    div.contenedor-barras{
      width: 54%;
      background: #fff;
      @media (max-width: 768px) {
        width: 100%;
        position:absolute;
      }

    }
    .contenedor-mapa{
      background: #fff;
        width: 46%;
        @media (max-width: 768px) {
        width:100%;
        position:absolute;
      }
    }
  }
}

</style>
