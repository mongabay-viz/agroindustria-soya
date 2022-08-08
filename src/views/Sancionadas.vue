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
import VizAnillos from '@/components/VizAnillos.vue'
import * as d3 from "d3";

export default {
  name: 'Sancionadas',
  components: {
    VizAnillos
  },
  data(){
    return {
      geojson: Object,
      datos:[],
    }
  },
  methods:{

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
