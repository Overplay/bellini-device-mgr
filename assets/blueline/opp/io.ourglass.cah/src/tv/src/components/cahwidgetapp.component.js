require( '../assets/cahtv.scss' );


class Controller {
    constructor( $log, ogAPI, $rootScope, cahGameService ) {

        this.$log = $log;
        this.$log.debug( 'loaded Widget Master Controller.' );
        this.ogAPI = ogAPI;
        this.$rootScope = $rootScope;
        this.gameService = cahGameService;


    }


    $onInit() {
        this.$log.debug( 'In $onInit' );

        this.state = this.gameService.getGameState();
        this.showApp = true;
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', '$rootScope', 'cahGameService' ];
    }
}

export const name = 'widgetComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   Controller,
    controllerAs: '$ctrl',
    template:     `
<div class="applet">
    <div class="apphdr">Cards Against Humanity</div>
    <div class="appsubhdr">SPORTS EDITION</div>
         <h3>State:{{$ctrl.state}}</h3>   
         <div class="ad-holder">
        <og-advert-xfade type="widget"></og-advert-xfade>
    </div>
</div>

      `
};

export default Component
