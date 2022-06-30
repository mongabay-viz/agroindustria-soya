<template>
  <div v-bind:id=barras_id class="contenedor-barras">
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
            <p style="padding:10px 0 5px 0" v-html="titulo_eje_y"></p>
          </div>
        </div>
      </div>
      <svg class="svg-barras">
        <defs></defs>
        <g class="grupo-fondo"></g>
        <g class="grupo-contenedor-de-barras"></g>
        <g class="grupo-frente"></g>
      </svg>
      <div class="eje-x">
        <p :style="{
                    padding: `${margen.abajo +10 }px ${margen.derecha}px 0 ${margen.izquierda + ancho_leyenda_y}px `
                }" v-html="titulo_eje_x"></p>
      </div>
    </div>
    <slot name="pie"></slot>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: 'DadsigBarras',
  props: {
    barras_id: String,
    datos: Array,
    variables: {
      type: Array,
      default: function () {
        return []
      }
    },

    nombre_barra: String,
    nombre_color: String,
    titulo_eje_y: String,
    titulo_eje_x: String,
    ancho_tooltip: {
      type: Number,
      default: 195
    },
    margen: {
      type: Object,
      default: function () {
        return {arriba: 20, abajo: 50, izquierda: 60, derecha: 20}
      }
    },
    alto_vis: {
      type: Number,
      default: function () {
        return 250
      }
    },
    espaciado_barras: {
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
        var txt = []
        this.variables.map((d) => {
          txt.push(`<p><span class="nomenclatura-tooltip" style="background: ${this.$store.state.color_cultivo}"></span>
						${d[this.nombre_color]} | <b>${this.tooltip_data_seleccionada[d.id].toLocaleString("en")}</b> 
						</p>`)
        })

        return `<p>${this.tooltip_categoria}</p>
						${txt.reverse().join(" ")}`
      }
    },
  },
  watch: {
    
    datos() {
      // todo esto se dispara cuando cambian los datos, i.e. seleccionamos un municipio distinto
      this.configurandoDimensionesParaBarras();
      this.creandoBarras();
      this.creandoSerie();
      this.actualizandoBarras();
      this.actualizandoSerie();;
    }
  },

  data() {
    return {
      ancho_leyenda_y: 0
    }
  },
  mounted() {
    this.svg = d3.select(`#${this.barras_id} .svg-barras`);
    this.grupo_contenedor = this.svg.select(".grupo-contenedor-de-barras");
    this.grupo_fondo = this.svg.select(".grupo-fondo");
    this.grupo_frente = this.svg.select(".grupo-frente");

    this.eje_y = this.grupo_contenedor
        .append("g")
        .attr("class", "eje-y")
    this.eje_x = this.grupo_contenedor
        .append("g")
        .attr("class", "eje-x")

    this.tooltip = d3.select(`#${this.barras_id} .tooltip`);
    this.configurandoDimensionesParaSVG();
    this.configurandoDimensionesParaBarras();
    this.creandoBarras();
    this.creandoSerie();
    this.actualizandoBarras();
    this.actualizandoSerie();;

    window.addEventListener("resize", this.reescalandoPantalla)


  },
  destroyed() {
    window.removeEventListener("resize", this.reescalandoPantalla)
  },
  methods: {
    configurandoDimensionesParaSVG() {
      this.ancho_leyenda_y = document.querySelector(`#${this.barras_id} .rotation-wrapper-outer .element-to-rotate`)
          .clientHeight;

      this.ancho = document.querySelector(`#${this.barras_id}`).clientWidth - this.margen.derecha - this.margen.izquierda - this.ancho_leyenda_y
      this.alto = this.alto_vis - this.margen.arriba - this.margen.abajo;

      this.svg
          .attr("width", this.ancho + this.margen.derecha + this.margen.izquierda)
          .attr("height", this.alto + this.margen.arriba + this.margen.abajo)
          .style("left", this.ancho_leyenda_y + "px");

      this.grupo_contenedor
          .attr("transform", `translate(${this.margen.izquierda},${this.margen.arriba})`)

      this.grupo_fondo
          .attr("transform", `translate(${this.margen.izquierda},${this.margen.arriba})`)

      this.grupo_frente
          .attr("transform", `translate(${this.margen.izquierda},${this.margen.arriba})`)

    },

    configurandoDimensionesParaBarras() {
      this.data_apilada = d3.stack()
          .keys(["cultivo"])(this.datos)
      for (let i = 0; i < ["cultivo"].length; i++) {
        this.data_apilada[i].forEach(d => {
          d.data = Object.assign({}, d.data, {"key": this.data_apilada[i].key})
        })
      }
        /// En este caso de gráfico necesito saber cual es mi valor más alto en cultivo y deforestación, para saber
        /// hasta donde llega y

        var y_max = d3.max(this.datos.map(d => d3.max([d.cultivo, d.deforestacion])))
        this.escalaY = d3.scaleLinear()
            .domain([0, y_max])
            .range([this.alto, 0]);
        this.escalaX = d3.scaleBand()
            .domain(this.datos.map(d => d.anio))
            .range([0, this.ancho])
            .padding(this.espaciado_barras)

        this.eje_y.call(d3.axisLeft(this.escalaY).ticks(4))
        this.eje_y.select("path.domain")
            .remove()
        this.eje_y.selectAll("line")
            .attr("x1", this.ancho)
            .style("stroke-dasharray", "3 2")
            .style("stroke", "#707070")

        this.eje_x.call(d3.axisBottom(this.escalaX))
            .attr("transform", `translate(${0}, ${this.alto})`)
        this.eje_x.select("path").remove()
        this.eje_x.selectAll("line").remove()


      
    },
    creandoBarras() {
      this.grupo_contenedor.selectAll(".g-rects").remove();

      this.barras_apiladas = this.grupo_contenedor
          .selectAll(".g-rects")
          .data(this.data_apilada)
          .enter()
          .append("g")
          .attr("class", (d) => `${d.key} g-rects`)
          .style("fill", this.$store.state.color_cultivo)

      this.barras_individuales = this.barras_apiladas
          .selectAll("rect")
          .data((d) => d)
          .enter()
          .append("rect")

      if (this.tooltip_activo) {
        this.svg
            .on("mousemove", (evento) => {
              this.mostrarTooltip(evento)
            })
            .on("mouseout", this.cerrarTooltip)
      }

    },
    creandoSerie(){

      //Esta funcion es nueva en este caso
      this.grupo_contenedor.selectAll(".linea").remove();
      this.serie_linea = this.grupo_contenedor
        .selectAll(".linea")
        .data([this.datos])//// Checa como aqui metemos un arreglo con un elemento this.datos, porque queremos que nos genere una sola linea, a diferencia de los marcadores en el siguiente comentario
        .enter()
        .append("path")
        .attr("class","linea")

      this.grupo_contenedor.selectAll(".marcadores").remove();
      this.marcadores = this.grupo_contenedor
        .selectAll(".marcadores")
        .data(this.datos) /// aquí queremos que nos genere un marcador para cada fecha, por eso metemos un elemento this.datos que tiene una longitud igual a la cantidad de años
        .enter()
        .append("rect")
        .attr("class","marcadores")
      
    },
  
    actualizandoBarras() {
        this.barras_individuales
            .attr("width", this.escalaX.bandwidth())
            .attr("height", d => this.escalaY(d[0]) - this.escalaY(d[1]))
            .attr("x", d => this.escalaX(d.data.anio))
            .attr("y", d => this.escalaY(d[1]))
        
    
    },
    actualizandoSerie(){
      /// y esta también es nueva
      this.serie_linea.attr("d", 
          d3.line()
            .x((dd) => this.escalaX(dd.anio) + .5 * this.escalaX.bandwidth())
            .y((dd) => this.escalaY(dd.deforestacion))  
        )
        .style("fill", "none")
        .style("stroke","red")

      var proporcion_marcador = .25  
      this.marcadores
            .attr("width", this.escalaX.bandwidth() * proporcion_marcador)
            .attr("height", this.escalaX.bandwidth() * proporcion_marcador)
            .attr("x", d => this.escalaX(d.anio)+ this.escalaX.bandwidth() * .5 - (.5 *proporcion_marcador * this.escalaX.bandwidth()))
            .attr("y", d => this.escalaY(d.deforestacion) - .5 * proporcion_marcador * this.escalaX.bandwidth())
    },

    reescalandoPantalla() {
      this.configurandoDimensionesParaSVG();
      this.configurandoDimensionesParaBarras();
      this.actualizandoBarras();
      this.actualizandoSerie();;

    },
    mostrarTooltip(evento) {
      // TODO: volter esto layerX y this.escalaX.step();
        this.tooltip_bandas = this.escalaX.step();
        this.tooltip_indice = parseInt((evento.layerX - this.margen.izquierda - this.margen.derecha) / this.tooltip_bandas)

        if (this.tooltip_indice < this.datos.length) {
          this.tooltip_categoria = this.escalaX.domain()[this.tooltip_indice]
          this.tooltip_data_seleccionada = this.data_apilada[0].filter(dd => (dd.data.anio == this.tooltip_categoria))[0].data;

          this.tooltip
              .style("visibility", "visible")
              .style("left", evento.layerX > .5 * (this.ancho + this.margen.izquierda + this.margen.derecha) ? `${evento.layerX - this.ancho_tooltip + this.ancho_leyenda_y - 20}px` : `${evento.layerX + this.ancho_leyenda_y + 20}px`)
              .style("width", this.ancho_tooltip + "px")
              .style("top", evento.layerY + "px")
              .style("height", "30px")

          let contenido_tooltip = this.tooltip.select(".tooltip-contenido")
              .style("background", "rgba(0, 0, 0,.8)")
              .style("min-width", this.ancho_tooltip + "px")
              .style("border-radius", "8px")
              .style("width", this.ancho_tooltip + "px")
              .attr("height", 70)
              .style("padding", "0 3px 0 10px")

          contenido_tooltip.select("div.tooltip-cifras")
              .html(this.textoTooltip())

          this.barras_individuales
              .style("fill-opacity", ".2")

          this.barras_individuales
              .filter(d => d.data.anio == this.tooltip_categoria)
              .style("fill-opacity", "1")
        }
      
      
    },
    cerrarTooltip() {
      this.tooltip
          .style("visibility", "hidden");
      this.barras_individuales
          .style("fill-opacity", "1")

    },

  }
}
</script>

<style lang="scss" scoped>
$border-radius-tarjeta: 10px;
svg.svg-barras {
  position: absolute;
  top: 0;
}

svg.svg-barras::v-deep text {
    font-family: "hiragino-kaku-gothic";


}

div.contenedor-tooltip-svg {
  position: relative;

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
    font-size: 12px;
    text-align: center;
    font-weight: 600;
  }


  div.tooltip {
    color: #fff;
    font-size: 12px;
    position: absolute;
    z-index: 2;
    visibility: hidden;
  }

  div.tooltip::v-deep
  div.tooltip-cifras {
    padding-bottom: 5px;

    p {
      margin: 3px;

      span.nomenclatura-tooltip {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: solid 1px rgba(255, 255, 255, .7);
        display: inline-block;
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