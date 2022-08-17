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
          ></div>
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
    <slot name="pie">
      <div class="pie">
        <button
          :class="{ activo: dato_seleccionado == 'cultivo' }"
          @click="dato_seleccionado = 'cultivo'"
        >
          <p>
            <span
              class="nomen-ha-cultivo"
              :style="{ background: $store.state['color_cultivo_' + cultivo] }"
            ></span>
            Hectáreas de cultivo
          </p>
        </button>
        <button
          :class="{ activo: dato_seleccionado == 'perdida-arborea' }"
          @click="dato_seleccionado = 'perdida-arborea'"
        >
          <p>
            <span
              class="nomen-ha-perdida-arborea"
              :style="{ background: $store.state.color_linea_serie }"
            ></span>
            Hectáreas de perdida arbórea
          </p>
        </button>
      </div>
    </slot>
    <div class="fuente">
      <p>
        Fuentes: Servicio de Información Agroalimentaria y Pesquera (SIAP) y
        Global Forest Watch-WRI-México.
      </p>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import { stringify } from "querystring";

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
    cultivo: {
      default: function () {
        return "soya";
      },
      type: String,
    },
    nombre_barra: String,
    nombre_color: String,
    titulo_eje_y: String,
    titulo_eje_x: String,
    ancho_tooltip: {
      type: Number,
      default: 334,
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
        return 434;
      },
    },
    espaciado_barras: {
      type: Number,
      default: function () {
        return 0.3;
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
        let texto =
          this.dato_seleccionado == "cultivo"
            ? `
        <div>
          <p>Año: <b>${this.tooltip_categoria}</b></p>
          <p>Cultivo: <b>${this.$store.state[
            "nombre_cultivo_" + this.cultivo
          ].toLowerCase()}</b></p>
          <p>Estado: <b>${
            this.tooltip_data_seleccionada
              ? this.tooltip_data_seleccionada.estado
              : ""
          }</b></p>
          <p>Municipio: <b>${
            this.tooltip_data_seleccionada
              ? this.tooltip_data_seleccionada.municipio
              : ""
          }</b></p>
          <p><span class="nomen-ha-cultivo" style="background: ${
            this.$store.state["color_cultivo_" + this.cultivo]
          }"></span> Hectáreas de cultivo: <b>${this.tooltip_data_seleccionada.cultivo.toLocaleString(
                "en"
              )}</b></p>
        </div>
        `
            : `
        <div>
          <p>Año: <b>${this.tooltip_categoria}</b></p>
          <p>Cultivo: <b>${this.$store.state[
            "nombre_cultivo_" + this.cultivo
          ].toLowerCase()}</b></p>
          <p>Estado: <b>${
            this.tooltip_data_seleccionada
              ? this.tooltip_data_seleccionada.estado
              : ""
          }</b></p>
          <p>Municipio: <b>${
            this.tooltip_data_seleccionada
              ? this.tooltip_data_seleccionada.municipio
              : ""
          }</b></p>
          <p><span class="nomen-ha-perdida-arborea" style="background: ${
            this.$store.state.color_linea_serie
          }"></span> Hectáreas de pérdida arbórea: <b>${this.tooltip_data_seleccionada.deforestacion.toLocaleString(
                "en"
              )}</b></p>
        </div>
        `;

        return texto;
      },
    },
  },
  watch: {
    datos(nv, ov) {
      // todo esto se dispara cuando cambian los datos, i.e. seleccionamos un municipio distinto
      this.configurandoDimensionesParaBarras();
      if (ov.length == 0) this.creando();

      this.actualizando();
    },
    dato_seleccionado(nv) {
      this.configurandoDimensionesParaBarras();
      this.actualizando();
      if (nv == "cultivo") {
        this.barras_individuales
          //.transition()
          .style("fill-opacity", 1);
        this.marcadores
          //.transition()
          .style("fill-opacity", 0);
        this.serie_linea
          //.transition()
          .style("fill-opacity", 0);
      } else {
        this.barras_individuales
          //.transition()
          .style("fill-opacity", 0);
        this.marcadores
          //.transition()
          .style("fill-opacity", 1);
        this.serie_linea
          //.transition()
          .style("fill-opacity", 0.5);
      }
    },
  },

  data() {
    return {
      ancho_leyenda_y: 0,
      tiempo_transicion: 500,
      dato_seleccionado: "cultivo",
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
      .style("color", "#4E4D33")
      .style("font-size", "12px")
      .style("letter-spacing", "1.07px")
      .style("text-align", "right");

    this.eje_x = this.grupo_contenedor
      .append("g")
      .attr("class", "eje-x")
      .style("color", "#4E4D33")
      .style("font-size", "12px")
      .style("letter-spacing", "1.07px")
      .style("text-align", "center");

    this.tooltip = d3.select(`#${this.barras_id} .tooltip`);
    this.configurandoDimensionesParaSVG();
    //this.configurandoDimensionesParaBarras();
    //this.creando();
    //this.actualizando();

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
      if (window.innerWidth > 768) {
        this.ancho =
          document.querySelector(`#${this.barras_id}`).clientWidth -
          this.margen.derecha -
          this.margen.izquierda -
          this.ancho_leyenda_y;
      } else {
        this.ancho = 768;
      }
      this.alto = this.alto_vis - this.margen.arriba - this.margen.abajo;

      this.svg
        .attr("width", this.ancho + this.margen.derecha + this.margen.izquierda)
        .attr("height", this.alto + this.margen.arriba + this.margen.abajo)
        .style("left", this.ancho_leyenda_y + "px");

      this.svg
        .append("text")
        .text("Ha")
        .attr("x", this.margen.izquierda - 8)
        .attr("y", this.margen.arriba - 12)
        .style("text-anchor", "end")
        .style("font-size", "14")
        .style("font-size", "12px")
        .style("fill", "#4E4D33")
        .style("letter-spacing", "1.07px")
        .style("text-align", "right");

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
      this.data_apilada = d3.stack().keys(["cultivo"])(this.datos);
      for (let i = 0; i < ["cultivo"].length; i++) {
        this.data_apilada[i].forEach((d) => {
          d.data = Object.assign({}, d.data, { key: this.data_apilada[i].key });
        });
      }

      var y_max;
      if (this.dato_seleccionado == "cultivo") {
        y_max = d3.max(this.datos.map((d) => d.cultivo));
      } else {
        y_max = d3.max(this.datos.map((d) => d.deforestacion));
      }
      this.escalaY = d3.scaleLinear().domain([0, y_max]).range([this.alto, 0]);
      this.escalaX = d3
        .scaleBand()
        .domain(this.datos.map((d) => d.anio))
        .range([0, this.ancho])
        .padding(this.espaciado_barras);

      this.eje_y
        .transition()
        .duration(500)
        .call(d3.axisLeft(this.escalaY).ticks(4));
      this.eje_y.select("path.domain").remove();
      this.eje_y
        .selectAll("line")
        .attr("x1", this.ancho)
        .style("stroke-dasharray", "3 2")
        .style("stroke", "#4E4D36");

      this.eje_x
        .transition()
        .duration(500)
        .call(d3.axisBottom(this.escalaX))
        .attr("transform", `translate(${0}, ${this.alto})`);
      this.eje_x.select("path").remove();
      this.eje_x.selectAll("line").remove();
    },
    creando() {
      this.creandoBarras();
      this.creandoSerie();
    },
    actualizando() {
      this.actualizandoBarras();
      this.actualizandoSerie();
    },
    creandoBarras() {
      this.grupo_contenedor.selectAll(".g-rects").remove();
      //console.log(this.datos)

      this.barras_individuales = this.grupo_contenedor
        .selectAll("rects")
        .data(this.datos)
        .enter()
        .append("rect")
        .attr("class", "rects")
        .style("fill", this.$store.state["color_cultivo_" + this.cultivo]);

      if (this.tooltip_activo) {
        this.svg
          .on("mousemove", (evento) => {
            this.mostrarTooltip(evento);
          })
          .on("mouseout", this.cerrarTooltip);
      }
    },
    creandoSerie() {
      //Esta funcion es nueva en este caso
      this.grupo_contenedor.selectAll(".linea").remove();
      this.serie_linea = this.grupo_contenedor
        .selectAll(".linea")
        .data([this.datos]) //// Checa como aqui metemos un arreglo con un elemento this.datos, porque queremos que nos genere una sola linea, a diferencia de los marcadores en el siguiente comentario
        .enter()
        .append("path")
        .attr("class", "linea")
        .style("fill-opacity", "0");

      this.grupo_contenedor.selectAll(".marcadores").remove();
      this.marcadores = this.grupo_contenedor
        .selectAll(".marcadores")
        .data(this.datos) /// aquí queremos que nos genere un marcador para cada fecha, por eso metemos un elemento this.datos que tiene una longitud igual a la cantidad de años
        .enter()
        .append("rect")
        .attr("class", "marcadores")
        .style("fill-opacity", "0");
    },

    actualizandoBarras() {
      this.barras_individuales
        .data(this.datos)
        .transition()
        .duration(this.tiempo_transicion)
        .attr("width", this.escalaX.bandwidth())
        .attr("height", (d) => this.escalaY(0) - this.escalaY(d.cultivo))
        .attr("x", (d) => this.escalaX(d.anio))
        .attr("y", (d) => this.escalaY(d.cultivo));
    },
    actualizandoSerie() {
      /// y esta también es nueva
      this.serie_linea
        .data([this.datos])
        .transition()
        .duration(this.tiempo_transicion)
        .attr(
          "d",
          d3
            .area()
            .x((dd) => this.escalaX(dd.anio) + 0.5 * this.escalaX.bandwidth())
            .y0((dd) => this.escalaY(0))
            .y1((dd) => this.escalaY(dd.deforestacion))
        )
        .style("fill", this.$store.state.color_linea_serie);

      //.style("stroke",this.$store.state.color_linea_serie)
      //.style("stroke-width","2px")

      var proporcion_marcador = 0.2;
      this.marcadores
        .data(this.datos)
        .attr("width", this.escalaX.bandwidth() * proporcion_marcador)
        .attr("height", this.escalaX.bandwidth() * proporcion_marcador)

        .transition()
        .duration(this.tiempo_transicion)
        .attr(
          "x",
          (d) =>
            this.escalaX(d.anio) +
            this.escalaX.bandwidth() * 0.5 -
            0.5 * proporcion_marcador * this.escalaX.bandwidth()
        )
        .attr(
          "y",
          (d) =>
            this.escalaY(d.deforestacion) -
            0.5 * proporcion_marcador * this.escalaX.bandwidth()
        )
        .style("fill", this.$store.state.color_linea_serie);
    },

    reescalandoPantalla() {
      this.configurandoDimensionesParaSVG();
      this.configurandoDimensionesParaBarras();
      this.actualizandoBarras();
      this.actualizandoSerie();
    },
    mostrarTooltip(evento) {
      // TODO: volter esto layerX y this.escalaX.step();
      this.tooltip_bandas = this.escalaX.step();
      this.tooltip_indice = parseInt(
        (evento.layerX - this.margen.izquierda) / this.tooltip_bandas
      );
      if (this.tooltip_indice < this.datos.length && this.tooltip_indice > -1) {
        this.tooltip_categoria = this.escalaX.domain()[this.tooltip_indice];
        this.tooltip_data_seleccionada = this.datos.filter(
          (dd) => dd.anio == this.tooltip_categoria
        )[0];
        this.tooltip
          .style("visibility", "visible")
          //.style("left", evento.layerX > .5 * (this.ancho + this.margen.izquierda + this.margen.derecha) ? `${evento.layerX - this.ancho_tooltip + this.ancho_leyenda_y - 30}px` : `${evento.layerX + this.ancho_leyenda_y + 20}px`)
          .style(
            "left",
            (evento.layerX < 0.5 * this.ancho_tooltip
              ? 0
              : evento.layerX >
                this.ancho +
                  this.margen.izquierda +
                  this.margen.derecha -
                  0.5 * this.ancho_tooltip
              ? this.ancho +
                this.margen.izquierda -
                this.margen.derecha -
                this.ancho_tooltip
              : evento.layerX - 0.5 * this.ancho_tooltip) + "px"
          )

          .style("width", this.ancho_tooltip + "px");

        let contenido_tooltip = this.tooltip
          .select(".tooltip-contenido")
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
          .style("letter-spacing", "0.32px")
          .style("color", "#FFFFFF");

        contenido_tooltip
          .select("div.tooltip-cifras")
          .html(this.textoTooltip());

        let alto_tooltip = parseInt(this.tooltip.style("height"));

        this.tooltip.style(
          "top",
          (evento.layerY >
          this.alto + this.margen.arriba + this.margen.abajo - alto_tooltip
            ? evento.layerY - 20 - alto_tooltip
            : evento.layerY + 20) + "px"
        );

        if (this.dato_seleccionado == "cultivo") {
          this.barras_individuales.style("fill-opacity", ".5");
          this.barras_individuales
            .filter((d) => d.anio == this.tooltip_categoria)
            .style("fill-opacity", "1");
        }
      }
    },
    cerrarTooltip() {
      this.tooltip.style("visibility", "hidden");
      if (this.dato_seleccionado == "cultivo") {
        this.barras_individuales.style("fill-opacity", "1");
        //.style("fill", "#D4DB9B")
      }
    },
  },
};
</script>

<style lang="scss">
.contenedor-barras{
$border-radius-tarjeta: 10px;
  svg.svg-barras {
    position: absolute;
    top: 0;
    background: #fff;
  }

  svg.svg-barras::v-deep text {
    font-family: "hiragino-kaku-gothic";
  }
  .fuente {
    color: #222100;
    font-size: 12px;
    letter-spacing: 0px;
    line-height: 16px;
    @media (max-width: 768px) {
      font-size: 10px;
      line-height: 14px;
    }
  }

  .pie {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
    @media (max-width: 768px) {
      justify-content: flex-start;
    }

    button {
      border: none;
      background: none;
      border-radius: 0;
      @media (max-width: 768px) {
        width: 271px;
      }
      p {
        margin: 0px;
        display: flex;
        line-height: 2.1;
        font-size: 12px;
        padding-left: 10px;
        color: #4e4d33;
        letter-spacing: 1.07;
        text-align: center;
        //      line-height: 16px;

        span {
          position: relative;
          margin-right: 10px;
          display: inline-flex;
          border: solid 1px #000;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          &::before {
            content: "";
            position: absolute;
            top: 0px;
            left: 0px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #fff;
          }
        }
      }
      &.activo {
        p span::before {
          top: 10px;
          left: 10px;
          width: 10px;
          height: 10px;
        }
      }
    }
  }
  div.contenedor-tooltip-svg {
    position: relative;
    width: 100%;
    @media (max-width: 768px) {
      width: 100%;
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
      color: #4e4d33;
    }

    .titulo-eje-y {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 1.25px;
      height: 0;
      color: #4e4d33;
    }

    div.tooltip {
      color: #ffffff;
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
        font-size: 16px;
        span {
          position: relative;
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
}
</style>
