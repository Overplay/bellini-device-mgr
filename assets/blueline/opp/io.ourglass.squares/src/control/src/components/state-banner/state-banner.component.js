require( './state.scss' );

class SBController {
    constructor( $log, sqControl, $rootScope) {

        this.$log = $log;
        this.$log.debug( 'loaded State Banner Controller.' );
        this.sqControl = sqControl;
        //this.$timeout = $timeout;
        //this.$state = $state;
        //this.uibHelper = uibHelper;

        this.$rootScope = $rootScope;
        this.showBanner = true;

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
    }

    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }

    getMessage(){
        return this.sqControl.upstreamGameState;
    }


    // injection here
    static get $inject() {
        return [ '$log', 'SqControlService', '$rootScope'];
    }
}

export const name = 'stateBanner';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:    SBController,
    controllerAs: '$ctrl',
    template:     `
        <div class="state-banner" ng-if="$ctrl.showBanner">
            {{ $ctrl.getMessage() | uppercase }}
        </div>
`
};

export default Component
