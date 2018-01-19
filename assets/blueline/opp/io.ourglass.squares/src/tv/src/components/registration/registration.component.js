require( './reg.scss' );


class RegController {
    constructor( $log, sqGameService ) {

        this.$log = $log;
        this.$log.debug( 'loaded TV Reg Controller.' );
        this.gameService = sqGameService;

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }


    // injection here
    static get $inject() {
        return [ '$log', 'sqGameService' ];
    }
}

export const name = 'regComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   RegController,
    controllerAs: '$ctrl',
    template:     `
        <div>State: {{$ctrl.gameService.gameState}}</div>
        <div>Players: {{$ctrl.gameService.numPlayers}}</div>
        <ul><li ng-repeat="p in $ctrl.gameService.players">{{ p.name }}</li> </ul>
`
};

export default Component
