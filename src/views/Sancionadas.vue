<template>
    <div class="vista-sancionadas">
      <h2>PÉRDIDA FORESTAL QUE NO SE SANCIONA</h2>
      <p>Estados en donde la Profepa inició procedimientos por cambio de uso de suelo forestal entre 2015 y febrero de 2022.</p>
      <p>Estado</p>
      <select name="estatal" id="selector-estatal" v-model="estado_seleccionado">
        <option :value="estado" v-for="(estado,i) in lista_estatal" :key="i">
        {{estado}}
        </option>
      </select>
      <BarrasAgrupadas
        :barras_id="'barras_agrupadas'"
        :datos="datos"
        :variables="[
          { id: 'Procesos iniciados', nombre_colores: 'Procesos iniciados', color: '#302D03'},
          { id: 'Sanciones', nombre_colores: 'Sanciones', color: '#AD8B20'},
        ]"
        :nombre_barra="'AÑO'"
        :nombre_color="'nombre_colores'"
        :alto_vis="400"
        :margen="{arriba: 20, abajo: 50, izquierda: 30, derecha: 20}"
        >

      </BarrasAgrupadas>
      <div class="pie">
        
        <p>
          <span
            class="procesos-iniciados"
            :style="{ background: '#302D03' }"
          ></span>
          Procesos iniciados
        </p>

        <p>
          <span
            class="sanciones-otorgadas"
            :style="{ background: '#AD8B20' }"
          ></span>
          Sanciones otorgadas
        </p>
      </div>
      <p>Fuente: Datos que Profepa entregó en respuesta a solicitudes de información.</p>
        
    </div>
</template>
<script>
import * as d3 from "d3";
import BarrasAgrupadas from "@/components/BarrasAgrupadas.vue"
export default {
  name: 'Sancionadas',
  components: {
    BarrasAgrupadas
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
        d["Sanciones"] = +d["Sanciones"];
        d["Procesos iniciados"] = +d["Procesos iniciados"];
        
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
  max-width: 1366px;
  margin:auto;
  .contenedor-tooltip-svg{
    min-width: 1000px;
  }
  .pie{
    p{
      display: flex;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1.07px;

      span{
        width: 18px;
        height: 18px;
        border-radius: 4px;
        margin-right: 10px;
        transform: translate(0, 2px);
      }
    }
  }
}
</style>
