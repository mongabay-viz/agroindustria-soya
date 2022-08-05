<template>
  <div id="app">
    <router-view/>

    
    
  </div>
</template>
<script>

export default {
  name: "App",
  mounted(){
      console.log(this.$route.name)

    if(this.$route.name == "soya"){
      this.$store.commit("modificandoMunicipioSeleccionado", "04006");

    }
    else if(this.$route.name == "cania"){
      this.$store.commit("modificandoMunicipioSeleccionado", "23010");

    }
    else if(this.$route.name == "palma"){
      this.$store.commit("modificandoMunicipioSeleccionado", "04003");
    }
    else if(this.$route.name == "sancionadas"){
      this.$store.commit("modificandoMunicipioSeleccionado", "23010");
    }
  }
}
</script>



<style lang="scss">
  @font-face {
  font-family: "hiragino-kaku-gothic";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("~@/assets/fonts/Heisei Kaku Gothic Std W3.otf");
}
@font-face {
  font-family: "hiragino-kaku-gothic";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("~@/assets/fonts/Heisei Kaku Gothic Std W5.otf");
}
body{
  margin: 0;
}
#app {
  font-family: "hiragino-kaku-gothic";
  color: #000;
  max-width: 1366px;
  margin: 20px auto;
  padding: 0 20px;
  @media (max-width: 768px) {
    padding: 20px 21px;
  }

  .titulo{
    margin: 0;
    width: 64%;
    line-height: 120%;
    font-size: 21px;
    text-align: justify;
    letter-spacing: 0px;
    color: #222100;
    @media (max-width: 768px) {
      font-size: 18px;
      width: 100%
    }

    span {
      font-weight: bolder;
    }
  }

  .municipio{
    font-size: 14px;
    letter-spacing: 1.25px;
    color: #4E4D33;
    margin-top: 24px;
    margin-bottom: 0px;
    @media (max-width: 768px) {
      margin-top: 16px;
    }
  }
  .controles{
    margin-right: 24px;
    margin-top: 6px;
    margin-bottom: 16px;
    @media (max-width: 768px) {
      padding-right: 20px;
      display: flex;
      gap: 8px;
    }
    .oculto-en-escritorio{
      display: none;
      @media (max-width: 768px) {
        display: inline-block;
        border: none;
        padding: 0;
        background: none;
        height: 36px;
      }
    }
    #selector_municipal {
      width: 46%;
      height: 36px;
      padding-left: 16px;

      border-color:#4E4D33;
      border-radius: 5px;
      text-transform: uppercase;
      letter-spacing: 0px;
      color: #4E4D33;
      font-size: 14px;
      font-weight: bold;
      opacity: 1;
      @media (max-width: 768px) {
        width: 100%;
        font-size: 12px;
      }
    }
  }
  .contenedor-graficos{
    display: flex;
    margin: 0px;
    gap:15px;
      @media (max-width: 768px) {
      //position: absolute;
      display: block;
      width: 100%;
    }
    div.contenedor-barras{
      width: 54%;
      background: #fff;

      @media (max-width: 768px) {
        width: calc(100% - 42px);
        height: 100%;
        position:absolute;
      }

    }
    .contenedor-mapa{
      background: #fff;
      width: 46%;
      @media (max-width: 768px) {
        width: calc(100% - 42px);
        position:absolute;
        height: 442px;
        z-index: -1;
        &.visible-en-movil{
          z-index: 1;
        }
      }
    }
  }
}

</style>
