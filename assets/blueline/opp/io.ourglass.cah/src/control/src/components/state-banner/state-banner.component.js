require( './state.scss' );

class SBController {
    constructor( $log, cahControl, $rootScope) {

        this.$log = $log;
        this.$log.debug( 'loaded State Banner Controller.' );
        this.cahControl = cahControl;
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
        return this.cahControl.upstreamGameState;
    }

    getLeftMsg(){
        if (this.cahControl.venueModel && this.cahControl.venueModel.players){
            return 'Hand ' + (this.cahControl.venueModel.handNum+1) + ' of ' + this.cahControl.venueModel.players.length;
        }
        return "";
    }

    getRightMsg() {
        if ( this.cahControl.myPlayer ) {
            return 'Wins: ' + this.cahControl.myPlayer.handsWon.length;
        }
        return "";
    }


    // injection here
    static get $inject() {
        return [ '$log', 'cahControlService', '$rootScope'];
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
             <div class="left-ban">{{ $ctrl.getLeftMsg() }}</div>
                <div class="center-ban">{{ $ctrl.getMessage() }}</div>
                <div class="right-ban">{{ $ctrl.getRightMsg() }}</div>
        </div>
`
};

export default Component
