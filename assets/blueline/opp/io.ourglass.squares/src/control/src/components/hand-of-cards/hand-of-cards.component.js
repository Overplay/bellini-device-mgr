require( './hand.scss' );


class HandController {
    constructor( $log, $timeout, uibHelper ) {

        this.$log = $log;
        this.$log.debug( 'loaded Hand Controller.' );
        this.$timeout = $timeout;
        this.uibHelper = uibHelper;

        this.waitingMsg = 'Beer time!';

    }

    nextcard( ev ) {
        this.$log.debug( 'Swipey!' );
        const top = this.hand.shift();
        this.hand.push( top );
    }

    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.picking = true;
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }

    cardStyle( index ) {
        return {
            'top':              index * 2 + 'px',
            'left':             6 + index * 2 + 'vw',
            'z-index':          1000 - index + '',
            'background-color': index ? '#AAAAAA' : '#FFFFFF'
        }
    }

    finalizeChoice( card ) {

        this.hand = [ card ];
        this.picking = false;
        this.cardChosen( card );
    }

    chose( card ) {

        if ( this.confirm ) {
            this.uibHelper.confirmModal( 'Confirm It', 'Are you sure you want to choose: "' + card.prompt + '"?' )
                .then( ( confirmed ) => {
                    this.$log.debug( 'Yeah baby!' );
                    this.finalizeChoice( card );
                } )
                .catch( () => {} );

        } else {
            this.finalizeChoice( card )
        }

    }

    displayPrompt( p ) {
        if ( !this.obfuscate ) return p;

        return 'WAITING for ALL PLAYERS to SUBMIT WHITE CARDS';
    }

    // injection here
    static get $inject() {
        return [ '$log', '$timeout', 'uibHelper' ];
    }
}

export const name = 'handComponent';

const Component = {
    $name$:       name,
    bindings:     { hand: '<', cardChosen: '=', chosenPrompt: '@?', obfuscate: '<?', confirm: '@?' },
    controller:   HandController,
    controllerAs: '$ctrl',
    template:     `
        <div class="hand-container">
         <div class="white-card" ng-repeat="c in $ctrl.hand" ng-style="$ctrl.cardStyle($index)" 
            ng-swipe-left="$ctrl.nextcard($event)" ng-swipe-right="$ctrl.nextcard($event)">
                {{ $ctrl.displayPrompt(c.prompt) }}
                <button class="btn btn-primary" 
                    ng-click="$ctrl.chose(c)"
                    ng-if="$ctrl.picking && !$ctrl.obfuscate">{{ $ctrl.chosenPrompt || "PLAY" }}</button>
                <div ng-if="!$ctrl.picking" class="wait">{{ $ctrl.waitingMsg }}</div>
         </div>
        </div>

`
};

export default Component
