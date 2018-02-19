/*********************************

 File:       oops.component.js
 Function:   Placeholder landing page if something goes wrong
 Copyright:  Ourglass TV
 Date:       2/8/18 1:11 AM
 Author:     mkahn


 **********************************/

require( './oops.scss' );


class OopsController {
    constructor( $log, ogAPI ) {

        this.$log = $log;
        this.$log.debug( 'loaded OopsController' );
        this.ogAPI = ogAPI;

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
    }

    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }

    btnClicked(){
        this.$log.debug('Doink!');
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI' ];
    }
}

export const name = 'oopsComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   OopsController,
    controllerAs: '$ctrl',
    template:     `
<div class="container">
    <div class="row">
        <div class="col-sm-10">
            <h4>OOPS!</h4>
            <button class="btn btn-warning" style="width: 100%;" ng-click="$ctrl.btnClicked()">CLICK ME</button>
        </div>
    </div>
</div>
`
};

export default Component


