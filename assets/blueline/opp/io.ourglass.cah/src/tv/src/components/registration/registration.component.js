require( './reg.scss' );


class RegController {
    constructor( $log, cahGameService ) {

        this.$log = $log;
        this.$log.debug( 'loaded TV Reg Controller.' );
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
        return [ '$log', 'cahGameService' ];
    }
}

export const name = 'regComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   RegController,
    controllerAs: '$ctrl',
    template:     `
        <h1>REGISTRATION OPEN</h1>
        <p>{{$ctrl.gameService.spotsLeft}} open spot{{ $ctrl.gameService.spotsLeft===1 ? '':'s'}}</p>
        <p ng-if="$ctrl.gameService.stateTimerRunning">{{$ctrl.gameService.stateTimerValue | minsec }}</p>
        <ul class="players"><li ng-repeat="p in $ctrl.gameService.players">{{ p.name }}</li> </ul>
`
};

export default Component
