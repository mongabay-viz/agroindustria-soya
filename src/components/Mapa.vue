<template>
    <div>
        <select name="municipios" id="selector_municipal" v-model="municipio_seleccionado">
            <option :value="municipio.id" v-for="municipio in listado_municipios" :key="municipio.id">{{municipio.nombre}}</option>
        </select>
        <div class="mapa" :id="id">
            
        </div>
    </div>
</template>
<script>
import * as L from 'leaflet';

export default{
    name: "Mapa",
    props: {
        id: String,
        geojson: Object,
    },
    data(){
        return {
            listado_municipios:[],
            municipio_seleccionado:"",
            icono: L.icon({
                iconUrl: require('@/assets/img/marcador.svg'),
                iconSize: [50, 50],
                iconAnchor: [25, 50],
            }),
        }
    },
    mounted(){
        this.municipio_seleccionado = this.$store.state.municipio_seleccionado;
        this.listado_municipios = this.geojson.features.map(d => {return { 
                "id": d.properties.id_mun,
                "nombre": `${d.properties.nom_mun}, ${d.properties.nom_ent}`
            }
        })

        this.creandoMapaBase();
        this.agregandoIconos();

    },
    methods: {
        creandoMapaBase(){
            // Este elemento popup es la caja de texto provicional que saldrá al dar click a los elementos  
            this.popup = L.popup();
            // Creamos un objeto mapa y lo agregamos al contenedor
            this.mapa = L.map(this.id).setView([23, -103], 5);

            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 15,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            })
            .addTo(this.mapa);
        },

        agregandoIconos(){
            L.geoJSON(this.geojson,{
                pointToLayer: (feature, latlng) => {
                    return L.marker(latlng, {
                        icon: this.icono
                    });
                },
                onEachFeature: (feature, layer) => {
                    layer.on("click",(d) => this.clickMarcador(feature) )
                }
            })
            .addTo(this.mapa)
        },

        clickMarcador(datum){
            let ef = [];
            // Con la siguiente linea, se liga el selector con los clicks en el mapa
            this.municipio_seleccionado = datum.properties.id_mun
            
        }
        
    },
    watch:{
        municipio_seleccionado(nv){
            if(nv != ""){
                this.$store.commit("modificandoMunicipioSeleccionado", nv);
                this.$store.commit("modificandoBaseSerie",
                    formateaDatos(
                        this.geojson.features.filter((d) => d.properties.id_mun == nv)[0].properties, 
                        this.$store.state.fecha_minima, 
                        this.$store.state.fecha_maxima)
                )
                console.log("mute!!")
            }
        }
    }
    
}

function formateaDatos(datos,fech_min, fech_max){
    var data_resultante = [];
    for( var i = fech_min; i < fech_max + 1;i++ ){
        data_resultante.push({
            "anio": i,
            "deforestacion": datos[i+"_deforestacion"],
            "cultivo": datos[i+"_cultivo"],
        })
    }
    console.log(data_resultante)
    return data_resultante

}
</script>
<style lang="scss">

@import "~leaflet/dist/leaflet.css";

.mapa{
    width: 100%;
    height: 600px;
}
</style>