<template>
    <div class="vista-sancionadas">
      <select name="estatal" id="selector-estatal" v-model="estado_seleccionado">
        <option :value="estado" v-for="(estado,i) in lista_estatal" :key="i">
        {{estado}}
        </option>
      </select>
      <BarrasApiladas
        :barras_id="'barras_agrupadas'"
        :datos="datos"
        :variables="[
          { id: 'Total', nombre_colores: 'Total', color: 'green'},
          { id: 'No sancionatoria', nombre_colores: 'No sancionatoria', color: 'red'},
        ]"
        :nombre_barra="'AÑO'"
        :nombre_color="'nombre_colores'"
        titulo_eje_y="Eje vertical (numérico)"
        titulo_eje_x="Eje horizontal (categórico)"
        :alto_vis="400"
        >

      </BarrasApiladas>
        
    </div>
</template>
<script>
import * as d3 from "d3";
import BarrasApiladas from "@/components/BarrasApiladas.vue"
export default {
  name: 'Sancionadas',
  components: {
    BarrasApiladas
  },
  data(){
    return {
      geojson: Object,
      datos:[],
      lista_estatal:[],
      estado_seleccionado: "Nacional"
    }
  },
  methods:{

  },
  beforeMount(){
    d3.csv("data/sanciones.csv").then((data) => {
      data.forEach(d=>{
        d["No sancionatoria"] = +d["No sancionatoria"];
        d["Total"] = +d["Total"];
        
      })
      this.datos_completos = data
      this.lista_estatal = [...new Set(this.datos_completos.map(d=>d.estado_inegi))]

      this.datos = this.datos_completos.filter(d => d.estado_inegi =="Nacional");
      console.log(this.datos)
    }) 
    
  },
  watch:{
    estado_seleccionado(nv){
      this.datos = this.datos_completos.filter(d => d.estado_inegi ==nv);

    }
  }

}
</script>
<style lang="scss">
.vista-sancionadas{
  width: 500px
}
</style>
