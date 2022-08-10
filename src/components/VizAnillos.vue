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
import { text } from "body-parser";
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
      this.creandoAnillos()
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
      municipio_seleccionado: "",
      categorias:["Sin registro","No sancionatoria","Sancionatoria"],
      dict_color: {
        "Sin registro":"red",
        "No sancionatoria":"green",
        "Sancionatoria":"blue"
      }
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

      this.grupo_contenedor
          .attr("transform", `translate(${this.margen.izquierda + .5 * this.ancho},${this.margen.arriba + .5 * this.ancho})`)


    },

    configurandoDimensionesParaAnillos() {

      this.data_apilada = d3.stack()
          .keys(this.categorias)(this.datos);
      for (let i = 0; i < this.categorias.length; i++) {
        this.data_apilada[i].forEach(d => {
          d.data = Object.assign({}, d.data, {"key": this.data_apilada[i].key})
        })
      }
      this.escalaRadial = d3.scaleBand()
        .domain(this.lista_anios)
        .range([this.ancho * .1, this.ancho * .48])
        .padding(.2)

      this.escalaAngular = d3.scaleLinear()
        .domain([0,d3.max(this.datos.map(d => d3.sum(this.categorias.map(dd => d[dd]))))])
        .range([0, 22/12 * Math.PI]);
    },
    creandoAnillos() {
      this.grupo_contenedor.selectAll(".anios").remove();

      if(this.datos.length > 0){
        console.log(this.datos,this.data_apilada)
        this.grupo_anios = this.grupo_contenedor
          .selectAll(".anios")
          .data(this.data_apilada)
          .enter()
          .append("g")
          .attr("class","anios")
          .attr("fill",(d) => this.dict_color[d.key])

        this.anillos = this.grupo_anios
          .selectAll("rebanadas")
          .data((d)=>{ return d})
          .enter()
          .append("path")
          .style("fill-opacity",".5")
        this.cantidades = this.grupo_anios
          .selectAll("cantidades")
          .data((d)=>{ return d})
          .enter()
          .append("text")
        this.fechas = this.grupo_contenedor
          .selectAll("anios")
          .data(this.lista_anios)
          .enter()
          .append("text")
      }
    },
  
    actualizandoAnillos() {
      if(this.datos.length > 0){
        this.municipio_seleccionado = this.datos[0].edo_municipio_


        this.anillos
          .attr("d", (d) => {
              return this.arc
                .innerRadius(this.escalaRadial(+d.data["AÑO"]))
                .outerRadius(this.escalaRadial(+d.data["AÑO"]) + this.escalaRadial.bandwidth())
                .startAngle(this.escalaAngular(d[0]))
                .endAngle(this.escalaAngular(d[1]))(d)
            }
            
          )
        this.cantidades
          .text(d=> d.data[d.data.key]!= "0.0"? parseInt(d.data[d.data.key]): "")
          .attr("x", (d)=>{ return this.escalaRadial(+d.data["AÑO"]) * Math.cos(this.escalaAngular(d[1]) - Math.PI * .5)
          })
          .attr("y", (d)=>{
            return this.escalaRadial(+d.data["AÑO"]) * Math.sin(this.escalaAngular(d[1])- Math.PI * .5)

          })
          .style("fill-opacity",".6")
        
        this.fechas
          .text(d=>d)
          .attr("x", (d)=>{ return this.escalaRadial(+d) * Math.cos(- Math.PI * .5)
          })
          .attr("y", (d)=>{
            return this.escalaRadial(+d) * Math.sin(- Math.PI * .5) - this.escalaRadial.bandwidth() * .5

          })
          .attr("text-anchor","end")
          .attr("dominant-baseline","middle")




          /*this.fecha
            .attr("transform",(d) => `translate(
              ${this.escalaRadial(d) * Math.sin(this.escalaAngular(0)) - this.escalaRadial.bandwidth() * .5}, 
              ${-this.escalaRadial(d) * Math.cos(this.escalaAngular(0))})rotate(-90)`)
            .style("fill","gray")
            .attr("dominant-baseline","middle")*/
      }
        
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