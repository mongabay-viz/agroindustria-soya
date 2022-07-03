import Vue from 'vue'
import Vuex from 'vuex'
import datos from "@/assets/data/soya.json";
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    datos: datos,
    nombre_cultivo:"Soya",
    municipio_seleccionado: "04006",
    fecha_maxima: 2020,
    fecha_minima: 2010,
    color_cultivo: "#A9B739",
    color_linea_serie:"#ED2626",
    background_tooltip: "rgba(34, 33, 0,.8)",
    base_serie:[]
  },
  mutations: {
    modificandoMunicipioSeleccionado(state, valor){
      state.municipio_seleccionado = valor;
    },
    modificandoBaseSerie(state, valor){
      state.base_serie = valor;
    },

  },
  actions: {
  },
  modules: {
  }
})
