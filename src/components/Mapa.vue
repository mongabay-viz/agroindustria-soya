<template>
    <div class="contenedor-mapa">
        
        <div class="mapa" :id="id">
            
        </div>
    </div>
</template>
<script>
import { mapGetters } from 'vuex';


import * as L from 'leaflet';
import * as d3 from "d3";
import "@/../node_modules/leaflet.tilelayer.colorfilter/src/leaflet-tilelayer-colorfilter.js"
export default{
    name: "Mapa",
    props: {
        id: String,
        geojson: Object,

    },
    data(){
        return {
            listado_municipios:[],
            listado_estados: [],
            municipio_seleccionado_mapa:"",
            icono: L.icon({
                iconUrl: require('@/assets/img/marcador.svg'),
                iconSize: [20, 30],
                iconAnchor: [10, 30],
            }),
            des_icono: L.icon({
                iconUrl: require('@/assets/img/desmarcador.svg'),
                iconSize: [20, 30],
                iconAnchor: [10, 30],
            })
        }
    },
    mounted(){
        
        this.variable = "adios"
        this.municipio_seleccionado_mapa = this.$store.state.municipio_seleccionado;
        this.listado_municipios = this.geojson.features.map(d => {return { 
                "id": d.properties.id_mun,
                "nombre": `${d.properties.nom_mun}, ${d.properties.nom_ent}`
            }
        })

        this.$store.commit("modificandoListadoMunicipiosSoya", this.listado_municipios)

        this.creandoMapaBase();
        this.agregandoIconos();

        this.listado_estados = this.geojson.features.map(d => {return  `${d.properties.nom_ent}`})
        this.$store.commit("modificandoListadoEstadosSoya", [...new Set(this.listado_estados)].join(", "));
        

    },
    methods: {
        creandoMapaBase(){
            // Este elemento popup es la caja de texto provicional que saldrá al dar click a los elementos  
            this.popup = L.popup();
            // Creamos un objeto mapa y lo agregamos al contenedor, el setview lo comenté porque encontré como ajustar el mapa a las coordenadas 
            this.mapa = L.map(this.id) //.setView([23, -103], 5);

            let filtro = ['invert:100%',
                "contrast:100%",
                "opacity:50%",
                "bright:1000%"]

            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            })
            .addTo(this.mapa);
            L.tileLayer.colorFilter('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.{ext}', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                subdomains: 'abcd',
                minZoom: 0,
                filter:filtro,

                ext: 'png'
            }).addTo(this.mapa);
        },

        agregandoIconos(){
            this.marcadores = L.geoJSON(this.geojson,{
                pointToLayer: (feature, latlng) => {
                    //console.log(feature, latlng)
                    switch(feature.properties.id_mun ){
                        case this.municipio_seleccionado_mapa: 
                            return L.marker(latlng, {
                                icon: L.icon({
                                    iconUrl: require('@/assets/img/marcador.svg'),
                                    iconSize: [20, 30],
                                    iconAnchor: [10, 30],
                                    className: "id"+feature.properties.id_mun
                                }),
                            });
                            
                        default:
                            return L.marker(latlng, {
                                icon: L.icon({
                                    iconUrl: require('@/assets/img/desmarcador.svg'),
                                    iconSize: [20, 30],
                                    iconAnchor: [10, 30],
                                    className: "id"+feature.properties.id_mun
                                }),
                            });
                    }
                    
                },
                onEachFeature: (feature, layer) => {
                    layer.on("click",(d) => this.clickMarcador(feature) )
                }
            })
            .addTo(this.mapa)
            //Encontré esta linea para ajustar el mapa a nuestras coordenadas
            this.mapa.fitBounds(this.marcadores.getBounds());
        },

        clickMarcador(datum){
            // Con la siguiente linea, se liga el selector con los clicks en el mapa
            this.municipio_seleccionado_mapa = datum.properties.id_mun
            
        }
        
    },
    watch:{
        municipio_seleccionado_mapa(nv,ov){
            if(nv != ""){
                this.$store.commit("modificandoMunicipioSeleccionado", nv);
                this.$store.commit("modificandoBaseSerie",
                    formateaDatos(
                        this.geojson.features.filter((d) => d.properties.id_mun == nv)[0].properties, 
                        this.$store.state.fecha_minima, 
                        this.$store.state.fecha_maxima)
                )
                d3.selectAll("img.leaflet-marker-icon.leaflet-zoom-animated.leaflet-interactive")
                    .attr("src",require('@/assets/img/desmarcador.svg'))
                
                d3.selectAll("img.leaflet-marker-icon.leaflet-zoom-animated.leaflet-interactive.id"+nv)
                    .attr("src",require('@/assets/img/marcador.svg'))

                //console.log(this.marcadores);
            }
        },
        regresaMunicipioSeleccionado(nv){
            this.$store.commit("modificandoBaseSerie",
                formateaDatos(
                    this.geojson.features.filter((d) => d.properties.id_mun == nv)[0].properties, 
                    this.$store.state.fecha_minima, 
                    this.$store.state.fecha_maxima)
            )
            d3.selectAll("img.leaflet-marker-icon.leaflet-zoom-animated.leaflet-interactive")
                .attr("src",require('@/assets/img/desmarcador.svg'))
            
            d3.selectAll("img.leaflet-marker-icon.leaflet-zoom-animated.leaflet-interactive.id"+nv)
                .attr("src",require('@/assets/img/marcador.svg'))
            //console.log("estoy leyendo cambios en store")


        }
    },
    computed:{
        ...mapGetters(["regresaMunicipioSeleccionado"])
    }
}

function formateaDatos(datum,fech_min, fech_max){
    let data_resultante = [];
    for( var i = fech_min; i < fech_max + 1;i++ ){
        data_resultante.push({
            "anio": i,
            "deforestacion": datum[i+"_deforestacion"],
            "cultivo": datum[i+"_cultivo"],
            "estado": datum.nom_ent,
            "municipio": datum.nom_mun,
        })
    }
    return data_resultante

}
</script>
<style lang="scss">

@import "~leaflet/dist/leaflet.css";

.mapa{
    height: 396px;
    margin-top: 10px;
}

.municipio{
    font-size: 14px;
    letter-spacing: 1.25px;
    color: #4E4D33;
    margin: 3px;
    margin-bottom: 0px;
}


</style>