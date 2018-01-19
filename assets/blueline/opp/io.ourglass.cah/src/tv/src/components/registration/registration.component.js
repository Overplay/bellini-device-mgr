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
        <div>State: {{$ctrl.gameService.gameState}}</div>
        <div>Players: {{$ctrl.gameService.spotsLeft}}</div>
        <ul><li ng-repeat="p in $ctrl.gameService.players">{{ p.name }}</li> </ul>
`
};

export default Component
