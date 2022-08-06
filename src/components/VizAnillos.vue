<template>
  <div v-bind:id="anillos_id" class="contenedor-anillos">
    <h2>{{catego_seleccionada}}, {{municipio_seleccionado}}</h2>
    <slot name="encabezado"></slot>
    <div class="contenedor-tooltip-svg">
      <div class="tooltip">
        <div class="tooltip-contenido">
          <div class="contenedor-boton-cerrar">
            <button class="boton-cerrar-tooltip" @click="cerrarTooltip">
              &times;
            </button>
          </div>
          <div class="tooltip-cifras"></div>
        </div>
      </div>
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
    ancho_tooltip: {
      type: Number,
      default: 334
    },
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
    tooltip_activo: {
      type: Boolean,
      default: function () {
        return true
      }
    },

    textoTooltip: {
      type: Function,
      default: function () {
        
        let texto = `
        <div>
          <p>Año: <b>${this.tooltip_categoria}</b></p>
          <p>Cultivo: <b>${this.$store.state['nombre_cultivo_'+ this.cultivo].toLowerCase()}</b></p>
          <p>Estado: <b>${this.tooltip_data_seleccionada ? this.tooltip_data_seleccionada.estado : ""}</b></p>
          <p>Municipio: <b>${this.tooltip_data_seleccionada ? this.tooltip_data_seleccionada.municipio : ""}</b></p>
          <p><span class="nomen-ha-cultivo" style="background: ${this.$store.state['color_cultivo_'+ this.cultivo]}"></span> Hectáreas de cultivo: <b>${this.tooltip_data_seleccionada.cultivo.toLocaleString("en")}</b></p>
          <p><span class="nomen-ha-perdida-arborea" style="background: ${this.$store.state.color_linea_serie}"></span> Hectáreas de pérdida arbórea: <b>${this.tooltip_data_seleccionada.deforestacion.toLocaleString("en")}</b></p>
        </div>
        `

        return texto
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
    this.configurandoDimensionesParaAnillos();
    this.creandoAnillos();
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
      this.escalaAngular = d3.scaleLinear()
        .domain([0,100])
        .range([0, 2 * Math.PI]);
      
      this.escalaRadial = this.escalaX = d3.scaleBand()
        .domain(this.lista_anios)
        .range([this.ancho * .1, this.ancho * .48])
        .padding(.2)
      

    },
    creandoAnillos() {
      this.grupo_anillos = this.grupo_contenedor
        .selectAll("anillos")
        .data(this.lista_anios)
        .enter()
        .append("g")


      this.anillos_base = this.grupo_anillos
        .append("path")
      this.anillos = this.grupo_anillos
        .append("path")
      this.fecha = this.grupo_anillos
        .append("text")
        .text(d=>d)
        .style("fill","gray")
      

    },
  
    actualizandoAnillos() {
      this.municipio_seleccionado = this.datos[0].edo_municipio_

      this.datos.forEach((d) => {
        d.total_sanciones = d3.sum(this.categorias_sanciones.map((dd) => +d[dd]))
      })
      this.anillos_base
        .attr("d", (anio) => {
            this.arc
              .innerRadius(this.escalaRadial(anio))
              .outerRadius(this.escalaRadial(anio) + this.escalaRadial.bandwidth())
              .startAngle(this.escalaAngular(0))
              .endAngle(2 * Math.PI )
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
          .attr("x", 0)
          .attr("y",  d=> -this.escalaRadial(d) * Math.cos(this.escalaAngular(0)))
          .style("fill","gray")

      
    
    },

    reescalandoPantalla() {
      this.configurandoDimensionesParaSVG();
      this.configurandoDimensionesParaAnillos();
      this.actualizandoAnillos();

    },
    mostrarTooltip(evento) {
        /*
        // TODO: volter esto layerX y this.escalaX.step();
        this.tooltip_bandas = this.escalaX.step();
        this.tooltip_indice = parseInt((evento.layerX - this.margen.izquierda ) / this.tooltip_bandas)

        if (this.tooltip_indice < this.datos.length) {
          this.tooltip_categoria = this.escalaX.domain()[this.tooltip_indice]
          this.tooltip_data_seleccionada = this.datos.filter(dd => (dd.anio == this.tooltip_categoria))[0];
          this.tooltip
              .style("visibility", "visible")
              //.style("left", evento.layerX > .5 * (this.ancho + this.margen.izquierda + this.margen.derecha) ? `${evento.layerX - this.ancho_tooltip + this.ancho_leyenda_y - 30}px` : `${evento.layerX + this.ancho_leyenda_y + 20}px`)
              .style("left", (evento.layerX < .5 * this.ancho_tooltip ? 0 : 
                evento.layerX >  this.ancho + this.margen.izquierda + this.margen.derecha - .5 * this.ancho_tooltip ? this.ancho + this.margen.izquierda - this.margen.derecha -  this.ancho_tooltip :
                evento.layerX - .5 * this.ancho_tooltip) + "px"
              )

              .style("width", this.ancho_tooltip + "px")

          let contenido_tooltip = this.tooltip.select(".tooltip-contenido")
              .style("background", this.$store.state.background_tooltip)
              .style("min-width", this.ancho_tooltip + "px")
              .style("border-radius", "8px")
              .style("width", this.ancho_tooltip + "px")
              .attr("height", 70)
              //.style("min-width", this.ancho_tooltip + "px")
              //.style("width", this.ancho_tooltip + "px")
              //.style("padding", "0 3px 0 10px")
              //.style("height", "143px")
              //.style("width", "314px")
              .style("border-radius", "5px")
              .style("padding", "10px")
              .style("font-size", "16px")
              .style("letter-spacing","0.32px")
              .style("color", "#FFFFFF")

          contenido_tooltip.select("div.tooltip-cifras")
              .html(this.textoTooltip())
          
          let alto_tooltip = parseInt(this.tooltip.style("height"))
          console.log((evento.layerY > .5 * alto_tooltip ? 0 : 
                evento.layerY <  this.alto + this.margen.arriba + this.margen.abajo - .5 * alto_tooltip ? this.alto + this.margen.arriba - this.margen.abajo -  alto_tooltip :
                evento.layerY - .5 * alto_tooltip))
          this.tooltip
            .style("top", (evento.layerY > this.alto + this.margen.arriba + this.margen.abajo - alto_tooltip ? evento.layerY - 20 - alto_tooltip : evento.layerY + 20 ) + "px"
              )


          this.anillos_individuales
              .style("fill-opacity", ".5")

          this.anillos_individuales
              .filter(d => d.anio == this.tooltip_categoria)
              .style("fill-opacity", "1")
        }
        */
      
      
    },
    cerrarTooltip() {
      this.tooltip
          .style("visibility", "hidden");
      this.anillos_individuales
          .style("fill-opacity", "1")
          //.style("fill", "#D4DB9B")

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


  div.tooltip {
    color: #FFFFFF;;
    font-size: 12px;
    position: absolute;
    z-index: 2;
    visibility: hidden;
  }

  div.tooltip div.tooltip-cifras {
    padding-bottom: 5px;

    p {
      margin: 0px;
      line-height: 1.4;
      font-size:16px;
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

  div.tooltip div.contenedor-boton-cerrar {
    height: auto;
    display: flex;
    width: 100%;
    padding-top: 5px;
    font-weight: 600;
  }

  div.tooltip button.boton-cerrar-tooltip {
    background: #fff;
    border: none;
    font-size: 30px;
    line-height: .9;
    font-weight: 300;
    padding: 0 5px;
    border-radius: 5px;
    margin: 0 0 0 auto;
    @media (min-width: 768px) {
      display: none;
    }
    cursor: pointer;

    img {
      width: 30px;
      height: 30px;
      float: right;
    }
  }
}
</style>