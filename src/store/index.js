import Vue from 'vue'
import Vuex from 'vuex'
import datos_soya from "@/assets/data/soya.json";
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    background_tooltip: "rgba(34, 33, 0,.8)",
    color_linea_serie:"#ED2626",
    /// Soya
    datos_soya: datos_soya,
    nombre_cultivo_soya:"Soya",
    municipio_seleccionado_soya: "04006",
    fecha_maxima_soya: 2020,
    fecha_minima_soya: 2010,
    color_cultivo_soya: "#A9B739",
    base_serie_soya:[],
    listado_municipios_soya: [],
    listado_estados_soya: [],
  },
  mutations: {
    modificandoMunicipioSeleccionadoSoya(state, valor){
      state.municipio_seleccionado_soya = valor;
    },
    modificandoBaseSerieSoya(state, valor){
      state.base_serie_soya = valor;
    },
    modificandoListadoMunicipiosSoya(state, valor){
      state.listado_municipios_soya = valor;
    },
    modificandoListadoEstadosSoya(state, value){
      state.listado_estados_soya = value;
    }
  },
  getters: {
    regresaMunicipioSeleccionadoSoya: (state) => {
      return state.municipio_seleccionado_soya
    }
  },
  actions: {
  },
  modules: {
  }
})
