<template>
  <div class="vista-sancionadas">
    <h2>PÉRDIDA FORESTAL QUE NO SE SANCIONA</h2>
    <p class="descripcion">
      Estados en donde la Profepa inició procedimientos por cambio de uso de
      suelo forestal entre 2015 y febrero de 2022.
    </p>
    <p class="titulo-selector">Estado</p>
    <select name="estatal" id="selector-estatal" v-model="estado_seleccionado">
      <option :value="estado" v-for="(estado, i) in lista_estatal" :key="i">
        {{ estado }}
      </option>
    </select>
    <BarrasAgrupadas
      :barras_id="'barras_agrupadas'"
      :datos="datos"
      :variables="[
        {
          id: 'Procesos iniciados',
          nombre_colores: 'Procesos iniciados',
          color: '#302D03',
        },
        { id: 'Sanciones', nombre_colores: 'Sanciones', color: '#AD8B20' },
      ]"
      :nombre_barra="'AÑO'"
      :nombre_color="'nombre_colores'"
      :alto_vis="360"
      :margen="{ arriba: 20, abajo: 50, izquierda: 35, derecha: 20 }"
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
    <p class="fuente">
      Fuente: Datos que Profepa entregó en respuesta a solicitudes de
      información.
    </p>
  </div>
</template>
<script>
import * as d3 from "d3";
import BarrasAgrupadas from "@/components/BarrasAgrupadas.vue";
export default {
  name: "Sancionadas",
  components: {
    BarrasAgrupadas,
  },
  data() {
    return {
      geojson: Object,
      datos: [],
      lista_estatal: [],
      estado_seleccionado: "Nacional",
    };
  },
  methods: {},
  beforeMount() {
    d3.csv("data/sanciones.csv").then((data) => {
      data.forEach((d) => {
        d["Sanciones"] = +d["Sanciones"];
        d["Procesos iniciados"] = +d["Procesos iniciados"];
      });
      this.datos_completos = data;
      this.lista_estatal = [
        ...new Set(this.datos_completos.map((d) => d.estado_inegi)),
      ];

      this.datos = this.datos_completos.filter(
        (d) => d.estado_inegi == "Nacional"
      );
      console.log(this.datos);
    });
  },
  watch: {
    estado_seleccionado(nv) {
      this.datos = this.datos_completos.filter((d) => d.estado_inegi == nv);
    },
  },
};
</script>
<style lang="scss">
.vista-sancionadas {
  max-width: 1366px;
  margin: auto;
  @media (max-width: 768px) {
    font-size: 10px;
    line-height: 14px;
  }
  .contenedor-tooltip-svg {
    min-width: 1000px;
  }

  h2 {
    margin: 0px;
    padding: 0px;
    color: #222100;
    font-size: 18px;
    line-height: 21px;
  }

  .descripcion {
    margin-top: 8px;
    margin-bottom: 0px;
    padding: 0px;
    color: #222100;
    font-size: 12px;
    line-height: 16px;
    @media (max-width: 768px) {
      margin-top: 16px;
    }
  }

  .titulo-selector {
    margin-top: 26px;
    margin-bottom: 6px;
    padding: 0px;
    color: #4e4d33;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 1.07px;
    @media (max-width: 768px) {
      margin-top: 24px;
    }
  }

  #selector-estatal {
    text-transform: uppercase;
    height: 36px;
    margin-top: 0px;
    padding-left: 8px;
    color: #4e4d33;
    font-size: 12px;
    line-height: 18px;
    font-weight: bold;
  }

  .pie {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
    @media (max-width: 768px) {
      justify-content: flex;
    }
    p {
      align-content: center;
      height: 22px;
      margin-bottom: 20px;
      display: flex;
      color: #4e4d33;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1.07px;
      line-height: 2;
      
     
      span {
        display: table-cell;
        vertical-align: middle;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        margin-right: 10px;
        transform: translate(0, 2px);
      }
    }
  }

  .fuente {
    margin: 0px;
    padding: 0px;
    color: #222100;
    font-size: 10px;
    line-height: 14px;
  }
}
</style>
