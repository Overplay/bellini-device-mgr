require( '../../assets/cahtv.scss' );


class RootController {
    constructor( $log, ogAPI, $rootScope, cahGameService ) {

        this.$log = $log;
        this.$log.debug( 'loaded Root Controller.' );
        this.ogAPI = ogAPI;
        this.$rootScope = $rootScope;
        this.gameService = cahGameService;


    }


    $onInit() {
        this.$log.debug( 'In $onInit' );

    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', '$rootScope', 'cahGameService' ];
    }
}

export const name = 'rootComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   RootController,
    controllerAs: '$ctrl',
    template:     `<div class="applet">
    <div class="top-wrapper">
        <div class="apphdr">Cards Against Humanity</div>
        <div class="appsubhdr">SPORTS EDITION</div>    
   </div>
   <ui-view></ui-view> 
   <!-- ads disabled until we figure out legal -->
   <!--<div class="ad-holder">-->
        <!--<og-advert-xfade type="widget"></og-advert-xfade>-->
   <!--</div>-->
</div>
      `
};

export default Component
