<template>
    <div>
        <p class="titulo">Municipios de 
      <span v-for="(estado, index) in $store.state.listado_estados_soya" :key="estado.id"> 
        <span v-if="index != 0 && index != $store.state.listado_estados_soya.length - 1">,</span> 
        <span v-if="index == $store.state.listado_estados_soya.length - 1"> y</span>
        {{estado}}</span> donde se detecta deforestación y pérdida arbórea por cultivo de <span>{{$store.state.nombre_cultivo}}</span> en los últimos 10 años</p>
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
        :margen="{'arriba': 40, 'abajo': 20, 'izquierda': 60, 'derecha': 20}"
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

import Mapa from '@/components/Mapa.vue'
import Serie from '@/components/Serie.vue'


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
