require( './watch.scss' );


let _broadcastListeners = [];

class WatchController {
    constructor( $log, cahControl, $rootScope, $timeout, uibHelper, $state ) {

        this.$log = $log;
        this.$log.debug( 'loaded DealController' );
        this.cahControl = cahControl;
        this.$timeout = $timeout;
        this.uibHelper = uibHelper;

        this.$rootScope = $rootScope;
        this.$state = $state;


        this.header = "LET'S GET IT ON!";
        this.message = "We just need to make sure you're still there and haven't gone off somewhere. Click READY when, you know, you're ready."
        this.showReadyButton = true;

        this.readyTick = this.readyTick.bind(this);

        this.readyTimeout = 15;


    }

    registerBroadcastListeners(){
        this.bcastListeners = [];

        const gs = this.$rootScope.$on( 'GAME_STATE', ( ev, data ) => {
            this.$log.debug( "Got GAME_STATE notice in Deal Controller" );


        } );
        this.bcastListeners.push( gs );

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.registerBroadcastListeners();
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
        this.bcastListeners.forEach( (ureg) => ureg() );
    }


    // injection here
    static get $inject() {
        return [ '$log', 'cahControlService', '$rootScope', '$timeout', 'uibHelper', '$state' ];
    }
}

export const name = 'watchComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller: WatchController,
    controllerAs: '$ctrl',
    template:     `
        <div>WATCH</div>

`
};

export default Component
