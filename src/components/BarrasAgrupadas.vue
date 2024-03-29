<template>
  <div v-bind:id="barras_id" class="contenedor-barras">
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
          <div
            :style="{
              width: `${alto_vis - margen.arriba - margen.abajo}px`,
              transform: `rotate(-90deg)translateX(calc(-100% - ${
                0.5 * margen.arriba
              }px))`,
            }"
            class="element-to-rotate"
          >
            <p style="padding: 0" v-html="titulo_eje_y"></p>
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
        <p
          :style="{
            padding: `${margen.abajo + 10}px ${margen.derecha}px 0 ${
              margen.izquierda + ancho_leyenda_y
            }px `,
          }"
          v-html="titulo_eje_x"
        ></p>
      </div>
    </div>
    <slot name="pie"> </slot>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "DadsigBarras",
  props: {
    barras_id: String,
    datos: Array,
    variables: {
      type: Array,
      default: function () {
        return [];
      },
    },

    nombre_barra: String,
    nombre_color: String,
    titulo_eje_y: String,
    titulo_eje_x: String,
    ancho_tooltip: {
      type: Number,
      default: 235,
    },
    margen: {
      type: Object,
      default: function () {
        return { arriba: 20, abajo: 50, izquierda: 60, derecha: 20 };
      },
    },
    alto_vis: {
      type: Number,
      default: function () {
        return 250;
      },
    },
    espaciado_barras: {
      type: Number,
      default: function () {
        return 0.1;
      },
    },
    logo_conacyt: {
      type: Boolean,
      default: function () {
        return true;
      },
    },
    tooltip_activo: {
      type: Boolean,
      default: function () {
        return true;
      },
    },
    textoTooltip: {
      type: Function,
      default: function () {
        var txt = [];
        this.variables.map((d) => {
          txt.push(`<p><span class="nomenclatura-tooltip" style="background: ${
            d.color
          }"></span>
						${d[this.nombre_color]}: <b>${this.tooltip_data_seleccionada[
            d.id
          ].toLocaleString("en")}</b>
						</p>`);
        });

        return `<p>Año: ${this.tooltip_categoria}</p>
						${txt.join(" ")}`;
      },
    },
  },
  watch: {
    variables() {
      this.configurandoDimensionesParaBarras();
      this.creandoBarras();
      this.actualizandoBarras();
    },
    datos() {
      this.configurandoDimensionesParaBarras();
      this.creandoBarras();
      this.actualizandoBarras();
    },
  },

  data() {
    return {
      width: 200,
      ancho_leyenda_y: 0,
    };
  },
  mounted() {
    this.svg = d3.select(`#${this.barras_id} .svg-barras`);
    this.grupo_contenedor = this.svg.select(".grupo-contenedor-de-barras");
    this.grupo_fondo = this.svg.select(".grupo-fondo");
    this.grupo_frente = this.svg.select(".grupo-frente");

    this.eje_y = this.grupo_contenedor
      .append("g")
      .attr("class", "eje-y")
      .style("transform", "translate(4px, 0)")
      .style("color", "#4E4D33")
      .style("font-size", "12px")
      .style("line-height", "20px")
      .style("letter-spacing", "1.07px");
    this.eje_x = this.grupo_contenedor
      .append("g")
      .attr("class", "eje-x")
      .style("color", "#4E4D33")
      .style("font-size", "12px")
      .style("line-height", "20px")
      .style("letter-spacing", "1.07px")
      .style("tex-align", "center");

    this.tooltip = d3.select(`#${this.barras_id} .tooltip`);
    this.configurandoDimensionesParaSVG();
    this.configurandoDimensionesParaBarras();
    this.creandoBarras();
    this.actualizandoBarras();

    window.addEventListener("resize", this.reescalandoPantalla);
  },
  destroyed() {
    window.removeEventListener("resize", this.reescalandoPantalla);
  },
  methods: {
    configurandoDimensionesParaSVG() {
      this.ancho_leyenda_y = document.querySelector(
        `#${this.barras_id} .rotation-wrapper-outer .element-to-rotate`
      ).clientHeight;

      this.ancho =
        document.querySelector(`#${this.barras_id} .contenedor-tooltip-svg`)
          .clientWidth -
        this.margen.derecha -
        this.margen.izquierda -
        this.ancho_leyenda_y;
      this.alto = this.alto_vis - this.margen.arriba - this.margen.abajo;

      this.svg
        .attr("width", this.ancho + this.margen.derecha + this.margen.izquierda)
        .attr("height", this.alto + this.margen.arriba + this.margen.abajo)
        .style("left", this.ancho_leyenda_y + "px");

      this.grupo_contenedor.attr(
        "transform",
        `translate(${this.margen.izquierda},${this.margen.arriba})`
      );

      this.grupo_fondo.attr(
        "transform",
        `translate(${this.margen.izquierda},${this.margen.arriba})`
      );

      this.grupo_frente.attr(
        "transform",
        `translate(${this.margen.izquierda},${this.margen.arriba})`
      );
    },

    configurandoDimensionesParaBarras() {
      this.data_apilada = d3.stack().keys(this.variables.map((d) => d.id))(
        this.datos
      );
      for (let i = 0; i < this.variables.length; i++) {
        this.data_apilada[i].forEach((d) => {
          d.data = Object.assign({}, d.data, { key: this.data_apilada[i].key });
        });
      }

      this.escalaY = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(
            this.datos.map((d) => d3.max(this.variables.map((dd) => d[dd.id])))
          ),
        ])
        .range([this.alto, 0]);
      this.escalaX = d3
        .scaleBand()
        .domain(this.datos.map((d) => d[this.nombre_barra]))
        .range([0, this.ancho])
        .padding(this.espaciado_barras);

      this.escalaXSub = d3
        .scaleBand()
        .domain(this.variables.map((d) => d.id))
        .range([0, this.escalaX.bandwidth()])
        .padding(0.1);

      this.eje_y.call(d3.axisLeft(this.escalaY).ticks(4));
      this.eje_y.select("path.domain").remove();
      this.eje_y
        .selectAll("line")
        .attr("x1", this.ancho)
        .style("stroke-dasharray", "3 2")
        .style("stroke", "#707070");

      this.eje_x
        .call(d3.axisBottom(this.escalaX))
        .attr("transform", `translate(${0}, ${this.alto})`);
      this.eje_x.select("path").remove();
      this.eje_x.selectAll("line").remove();
    },
    creandoBarras() {
      this.grupo_contenedor.selectAll(".g-rects").remove();

      this.barras_agrupadas = this.grupo_contenedor
        .selectAll(".g-rects")
        .data(this.data_apilada)
        .enter()
        .append("g")
        .attr("class", (d) => `${d.key} g-rects`)
        .style("fill", (d, i) => this.variables[i].color);

      this.barras_individuales = this.barras_agrupadas
        .selectAll("rect")
        .data((d) => d)
        .enter()
        .append("rect");

      if (this.tooltip_activo) {
        this.svg
          .on("mousemove", (evento) => {
            this.mostrarTooltip(evento);
          })
          .on("mouseout", this.cerrarTooltip);
      }
    },
    actualizandoBarras() {
      this.barras_individuales
        .attr("width", this.escalaXSub.bandwidth)
        .attr("height", (d) => this.escalaY(d[0]) - this.escalaY(d[1]))
        .attr(
          "x",
          (d) =>
            this.escalaX(d.data[this.nombre_barra]) +
            this.escalaXSub(d.data.key)
        )
        .attr("y", (d) => this.escalaY(d[1] - d[0]));
    },

    reescalandoPantalla() {
      this.configurandoDimensionesParaSVG();
      this.configurandoDimensionesParaBarras();
      this.actualizandoBarras();
    },
    mostrarTooltip(evento) {
      // TODO: volter esto layerX y this.escalaX.step();
      this.tooltip_bandas = this.escalaX.step();
      this.tooltip_indice = parseInt(
        (evento.layerX - this.margen.izquierda - this.margen.derecha) /
          this.tooltip_bandas
      );

      if (this.tooltip_indice < this.datos.length) {
        this.tooltip_categoria = this.escalaX.domain()[this.tooltip_indice];
        this.tooltip_data_seleccionada = this.data_apilada[0].filter(
          (dd) => dd.data[this.nombre_barra] == this.tooltip_categoria
        )[0].data;

        this.tooltip
          .style("visibility", "visible")
          .style(
            "left",
            evento.layerX >
              0.5 * (this.ancho + this.margen.izquierda + this.margen.derecha)
              ? `${
                  evento.layerX - this.ancho_tooltip + this.ancho_leyenda_y - 20
                }px`
              : `${evento.layerX + this.ancho_leyenda_y + 20}px`
          )
          .style("width", this.ancho_tooltip + "px")
          .style("top", evento.layerY + "px")
          .style("height", "30px");

        let contenido_tooltip = this.tooltip
          .select(".tooltip-contenido")
          .style("background", "rgba(34, 33, 0,.8)")
          .style("min-width", this.ancho_tooltip + "px")
          .style("border-radius", "8px")
          .style("width", this.ancho_tooltip + "px")
          .attr("height", 70)
          .style("padding", "0 3px 0 10px");

        contenido_tooltip
          .select("div.tooltip-cifras")
          .html(this.textoTooltip());

        this.barras_individuales.style("fill-opacity", ".2");

        this.barras_individuales
          .filter((d) => d.data[this.nombre_barra] == this.tooltip_categoria)
          .style("fill-opacity", "1");
      }
    },
    cerrarTooltip() {
      this.tooltip.style("visibility", "hidden");
      this.barras_individuales.style("fill-opacity", "1");
    },
  },
};
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
.contenedor-barras {
  overflow-x: auto;
  padding-bottom: 0px;
  margin-top: 16px;
  padding-left: 0px;
  @media (max-width: 768px) {
    margin-top: 10px;
  }
}
div.contenedor-tooltip-svg {
  position: relative;
  overflow-x: scroll;
  overflow-y: hidden;

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
    height: 20px;
    text-align: center;
    font-size: 12px;
    text-align: center;
    font-weight: 600;
    @media (max-width: 768px) {
      height: 28px;
    }
  }

  div.tooltip {
    color: #fff;
    font-size: 12px;
    position: absolute;
    z-index: 2;
    visibility: hidden;
  }

  div.tooltip::v-deep div.tooltip-cifras {
    padding-bottom: 5px;

    p {
      margin: 3px;

      span.nomenclatura-tooltip {
        width: 20px;
        height: 10px;
        border-radius: 2px;
        border: solid 1px #838270;
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
    color: #fff;
    background: none;
    border: none;
    font-size: 30px;
    line-height: 0.9;
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
