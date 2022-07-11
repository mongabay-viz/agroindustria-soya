import Vue from 'vue'
import Vuex from 'vuex'
import datos_soya from "@/assets/data/soya.json";
import datos_cania from "@/assets/data/cania.json";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    background_tooltip: "rgba(34, 33, 0,.8)",
    color_linea_serie:"#ED2626",
    municipio_seleccionado: "",

    /// Soya
    datos_soya: datos_soya,
    nombre_cultivo_soya:"Soya",
    fecha_maxima_soya: 2020,
    fecha_minima_soya: 2010,
    color_cultivo_soya: "#A9B739",
    base_serie_soya:[],
    listado_municipios_soya: [],
    listado_estados_soya: [],
    /// Caña
    datos_cania: datos_cania,
    nombre_cultivo_cania:"cania",
    fecha_maxima_cania: 2020,
    fecha_minima_cania: 2010,
    color_cultivo_cania: "#000",
    base_serie_cania:[],
    listado_municipios_cania: [],
    listado_estados_cania: [],
  },
  mutations: {
    modificandoMunicipioSeleccionado(state, valor){
      state.municipio_seleccionado = valor;
    },
    modificandoBaseSerieSoya(state, valor){
      state.base_serie_soya = valor;
    },
    modificandoListadoMunicipiosSoya(state, valor){
      state.listado_municipios_soya = valor;
    },
    modificandoListadoEstadosSoya(state, value){
      state.listado_estados_soya = value;
    },

    modificandoBaseSerieCania(state, valor){
      state.base_serie_cania = valor;
    },
    modificandoListadoMunicipiosCania(state, valor){
      state.listado_municipios_cania = valor;
    },
    modificandoListadoEstadosCania(state, value){
      state.listado_estados_cania = value;
  
    }
  },
  getters: {
    regresaMunicipioSeleccionado: (state) => {
      return state.municipio_seleccionado
    }
  },
  actions: {
  },
  modules: {
  }
})
