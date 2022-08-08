<template>
  <div v-bind:id="anillos_id" class="contenedor-anillos">
    <h2>{{catego_seleccionada}}, {{municipio_seleccionado}}</h2>
    <slot name="encabezado"></slot>
    <div class="contenedor-tooltip-svg">

      <div class="rotation-wrapper-outer">
        <div class="rotation-wrapper-inner">
          <div :style="{width: `${alto_vis - margen.arriba - margen.abajo}px`,
                    transform: `rotate(-90deg)translateX(calc(-100% - ${.5 * margen.arriba}px))`}" class="element-to-rotate">
          </div>
        </div>
      </div>
      <svg class="svg-anillos">
        <defs></defs>
        <g class="grupo-fondo"></g>
        <g class="grupo-contenedor-de-anillos"></g>
        <g class="grupo-frente"></g>
      </svg>
      <div class="eje-x">
        <p :style="{
          padding: `${margen.abajo +10 }px ${margen.derecha}px 0 ${margen.izquierda + ancho_leyenda_y}px `
        }" v-html="titulo_eje_x"></p>
      </div>
    </div>
    <slot name="pie">

    </slot>
  </div>
</template>

<script>
import * as d3 from "d3";
import { stringify } from "querystring";

export default {
  name: 'DadsigAnillos',
  props: {
    anillos_id: String,
    datos: Array,
    variables: {
      type: Array,
      default: function () {
        return []
      }
    },
    cultivo: {
      default:function(){return "soya"},
      type: String
    },
    titulo_eje_y: String,
    titulo_eje_x: String,

    margen: {
      type: Object,
      default: function () {
        return {arriba: 20, abajo: 20, izquierda: 20, derecha: 20}
      }
    },
    
    espaciado_anillos: {
      type: Number,
      default: function () {
        return .3
      }
    },

  },
  watch: {
    
    datos(nv, ov) {
      // todo esto se dispara cuando cambian los datos, i.e. seleccionamos un municipio distinto
      this.configurandoDimensionesParaAnillos();
      
      this.actualizandoAnillos();
    }
  },

  data() {
    return {
      ancho_leyenda_y: 0,
      tiempo_transicion: 500,
      alto_vis: 434,
      lista_anios: d3.range(2015,2023),
      categorias_sanciones: ["sin información","no sancionado","sancionado","redirigido"],
      catego_seleccionada:"sancionado",
      municipio_seleccionado: ""
    }
  },
  mounted() {
    
    this.svg = d3.select(`#${this.anillos_id} .svg-anillos`);
    this.grupo_contenedor = this.svg.select(".grupo-contenedor-de-anillos");
    this.grupo_fondo = this.svg.select(".grupo-fondo");
    this.grupo_frente = this.svg.select(".grupo-frente");

    this.arc = d3.arc()
    this.eje_y = this.grupo_contenedor
        .append("g")
        .attr("class", "eje-y")
        .style("color", "#4E4D33")
        .style("font-size", "12px")
        .style("letter-spacing", "1.07px")
        .style("text-align", "right")


    this.eje_x = this.grupo_contenedor
        .append("g")
        .attr("class", "eje-x")
        .style("color", "#4E4D33")
        .style("font-size", "12px")
        .style("letter-spacing", "1.07px")
        .style("text-align", "center")

    this.tooltip = d3.select(`#${this.anillos_id} .tooltip`);
    this.configurandoDimensionesParaSVG();
    this.creandoAnillos();
    this.configurandoDimensionesParaAnillos();

    this.actualizandoAnillos();

    window.addEventListener("resize", this.reescalandoPantalla)


  },
  destroyed() {
    window.removeEventListener("resize", this.reescalandoPantalla)
  },
  methods: {
    configurandoDimensionesParaSVG() {
      this.ancho_leyenda_y = document.querySelector(`#${this.anillos_id} .rotation-wrapper-outer .element-to-rotate`)
          .clientHeight;

        this.ancho = document.querySelector(`#${this.anillos_id}`).clientWidth - this.margen.derecha - this.margen.izquierda - this.ancho_leyenda_y

      this.alto_vis = document.querySelector(`#${this.anillos_id}`).clientWidth
      this.alto = this.alto_vis - this.margen.arriba - this.margen.abajo;

      this.svg
          .attr("width", this.ancho + this.margen.derecha + this.margen.izquierda)
          .attr("height", this.alto + this.margen.arriba + this.margen.abajo)
          .style("left", this.ancho_leyenda_y + "px");
      
      
      this.svg.append("text")
        .attr("x", this.margen.izquierda - 8)
        .attr("y",this.margen.arriba - 12)
        .style("text-anchor","end")
        .style("font-size","14")
        .style("font-size","12px")
        .style("fill", "#4E4D33")
        .style("letter-spacing", "1.07px")
        .style("text-align", "right")
        
      this.grupo_contenedor
          .attr("transform", `translate(${this.margen.izquierda + .5 * this.ancho},${this.margen.arriba + .5 * this.ancho})`)

      this.grupo_fondo
          .attr("transform", `translate(${this.margen.izquierda},${this.margen.arriba})`)

      this.grupo_frente
          .attr("transform", `translate(${this.margen.izquierda},${this.margen.arriba})`)

    },

    configurandoDimensionesParaAnillos() {
      this.datos.forEach((d) => {
        d.total_sanciones = d3.sum(this.categorias_sanciones.map((dd) => +d[dd]))
      })
      this.escalaAngular = d3.scaleLinear()
        .domain([0,100])
        .range([ 1.5 * Math.PI, 0]);
      
      this.escalaRadial = d3.scaleBand()
        .domain(this.lista_anios)
        .range([this.ancho * .1, this.ancho * .48])
        .padding(.2)
      var y_max = d3.max(this.datos.map(d => d.total_sanciones))
      y_max = y_max ? y_max : 0;
      
      this.escalaAlturaBarras = d3.scaleLinear()
          .domain([0, y_max])
          .range([this.ancho * .5 - 50, 0]);
      

    },
    creandoAnillos() {
      this.grupo_anios = this.grupo_contenedor
        .selectAll("anios")
        .data(this.lista_anios)
        .enter()
        .append("g")
      this.anillos_base = this.grupo_anios
        .append("path")
      this.anillos = this.grupo_anios
        .append("path")
      this.barras = this.grupo_anios
        .append("rect")

      this.fecha = this.grupo_anios
        .append("text")
        .text(d=>d)
        .style("fill","gray")

      this.cifras = this.grupo_anios
        .append("text")
        
      

    },
  
    actualizandoAnillos() {
      this.municipio_seleccionado = this.datos[0].edo_municipio_

      
      this.anillos_base
        .attr("d", (anio) => {
            this.arc
              .innerRadius(this.escalaRadial(anio))
              .outerRadius(this.escalaRadial(anio) + this.escalaRadial.bandwidth())
              .startAngle(this.escalaAngular(0))
              .endAngle(this.escalaAngular(100))
            return this.arc()
      })
      .style("fill","#bfbfbf")

      this.anillos
        .attr("d", (anio) => {
          let datum = this.datos.filter(d=>d["AÑO"] == anio);
          if(datum.length == 1){
            datum = datum[0]
            this.arc
              .innerRadius(this.escalaRadial(anio))
              .outerRadius(this.escalaRadial(anio) + this.escalaRadial.bandwidth())
              .startAngle(this.escalaAngular(0))
              .endAngle(this.escalaAngular(100 * datum[this.catego_seleccionada] / datum.total_sanciones))
            return this.arc()
          }
          else{
             this.arc
              .innerRadius(this.escalaRadial(anio))
              .outerRadius(this.escalaRadial(anio) + this.escalaRadial.bandwidth())
              .startAngle(this.escalaAngular(0))
              .endAngle(this.escalaAngular(0))
          }
        })
        this.fecha
          .attr("transform",(d) => `translate(
            ${this.escalaRadial(d) * Math.sin(this.escalaAngular(0)) - this.escalaRadial.bandwidth() * .5}, 
            ${-this.escalaRadial(d) * Math.cos(this.escalaAngular(0))})rotate(-90)`)
          .style("fill","gray")
          .attr("dominant-baseline","middle")
        

        this.barras
          .attr("transform", `translate(${0},${-.5 * this.alto})`)
          .attr("x", (anio) => this.escalaRadial(anio) * Math.sin(this.escalaAngular(0)) - this.escalaRadial.bandwidth())
          .attr("y", (anio) => {
            let datum = this.datos.filter(d=>d["AÑO"] == anio);
            if(datum.length == 1){
              datum = datum[0]
              return this.escalaAlturaBarras(datum.total_sanciones)
            }
            else{
              return 0;  
            }
           
            
          })
          .attr("width", this.escalaRadial.bandwidth())
          .attr("height", (anio) => {
            let datum = this.datos.filter(d=>d["AÑO"] == anio);
            if(datum.length == 1){
              datum = datum[0]
              return this.escalaAlturaBarras(0) - this.escalaAlturaBarras(datum.total_sanciones);
            }
            else{
              return 0;  
            }
          })
        

        this.cifras
          .text(((anio) => {
              let datum = this.datos.filter(d=>d["AÑO"] == anio);
              if(datum.length == 1){
                datum = datum[0]
                return datum.total_sanciones
              }
              else{
                return 0;  
              }
            })
          )
          .attr("transform", (anio) => {
            let datum = this.datos.filter(d=>d["AÑO"] == anio);
            if(datum.length == 1){
              datum = datum[0]
              return `translate(
                ${this.escalaRadial(anio) * Math.sin(this.escalaAngular(0)) - this.escalaRadial.bandwidth() * .5}, 
                ${ this.escalaAlturaBarras(datum.total_sanciones) - this.alto * .5})rotate(-90)`
            }
            else{
              return `translate(
                ${this.escalaRadial(anio) * Math.sin(this.escalaAngular(0)) - this.escalaRadial.bandwidth() * .5}, 
                ${ this.escalaAlturaBarras(0)  - this.alto * .5})rotate(-90)`
            }
            

          })
          .style("fill","gray")
          .attr("dominant-baseline","middle")

      
    
    },

    reescalandoPantalla() {
      this.configurandoDimensionesParaSVG();
      this.configurandoDimensionesParaAnillos();
      this.actualizandoAnillos();

    },


  }
}
</script>

<style lang="scss">

$border-radius-tarjeta: 10px;
svg.svg-anillos {
  position: absolute;
  top: 0;
  background : #fff;
}


svg.svg-anillos::v-deep text {
    font-family: "hiragino-kaku-gothic";
}

.pie{
     p{margin: 0px;
      line-height: 1.4;
      font-size:16px;
        padding-left: 10px;

      span{
        position: relative;
        display: inline-block;
      }
      span.nomen-ha-cultivo{
        width: 20px;
        height: 14px;
        border-radius: 4px;
        transform: translate(0, 2px);
      }
      span.nomen-ha-perdida-arborea{
        width: 20px;
        height: 2px;
        transform: translate(0, -5px);
      }
    }
    
  }
div.contenedor-tooltip-svg {
  
  position: relative;
  width: 100%;
  @media (max-width: 768px) {
      width: 100%
    }
  overflow-x: scroll;
  overflow-y: hidden;
  padding-bottom: 10px;

  .rotation-wrapper-outer {
    display: table;

    .rotation-wrapper-inner {
      padding: 50% 0;
      height: 0;

      .element-to-rotate {
        display: block;
        transform-origin: top left;
        //transform: rotate(-90deg) translate(-100%);
        margin-top: -50%;
        font-size: 12px;
        text-align: center;
        font-weight: 600;
      }
    }
  }


  div.eje-x {
    position: relative;
    width: 100%;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1.25px;
    color: #4E4D33;
  }

  .titulo-eje-y{
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1.25px; 
    height:0;
    color: #4E4D33;
  }
}
</style>