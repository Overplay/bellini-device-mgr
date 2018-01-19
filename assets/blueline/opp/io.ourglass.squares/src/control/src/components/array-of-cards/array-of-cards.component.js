require( './array.scss' );


class AOCController {
    constructor( $log ) {

        this.$log = $log;
        this.$log.debug( 'loaded AOC Controller.' );


    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.header = 'PLAYED WHITE CARDS';
    }

    $onChanges(changes) {

        if (changes.winner){
            this.header = 'WINNER CHOSEN!';
        }

    }


    getRowClass(card) {

        if (!this.winner) return;
        const cls  =  card.id === this.winner.id ? 'winner' : 'loser';
        return cls;
    }

    chose(card){


    }



    // injection here
    static get $inject() {
        return [ '$log' ];
    }
}

export const name = 'aocComponent';

const Component = {
    $name$:       name,
    bindings:     { cards: '<', winner: '<' },
    controller: AOCController,
    controllerAs: '$ctrl',
    template:     `
        <div class="array-container">
         <h1>{{ $ctrl.header }}</h1>
            <div class="aholder" ng-repeat="c in $ctrl.cards" ng-class="$ctrl.getRowClass(c)">
                <div class="cardicon"><image src="cardicon.png"/></div>
                <div class="aprompt">{{ c.prompt }}</div>
            </div>
        </div>

`
};

export default Component
