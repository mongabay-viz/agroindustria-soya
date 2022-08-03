<template>
    <div>
        <VizAnillos
        :anillos_id="'anillos'"
        :datos="datos"
        ></VizAnillos>
    </div>
</template>
<script>
import { mapState } from 'vuex';

import Mapa from '@/components/Mapa.vue'
import Serie from '@/components/Serie.vue'
import VizAnillos from '@/components/VizAnillos.vue'
import * as d3 from "d3";

export default {
  name: 'Sancionadas',
  components: {
    Mapa,
    Serie,
    VizAnillos
  },
  data(){
    return {
      geojson: Object,
      datos:[],

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
    d3.csv("data/sanciones.csv").then((data) => {
      this.datos_completos = data
      this.datos = this.datos_completos.filter(d=> d.cvegeo =="23010")
    }) 
    
  },
  computed: {
    ...mapState(["base_serie_cania"])
  },
  watch: {
    base_serie_cania(nv){
      this.data_series = nv;
    },
  }

}
</script>
