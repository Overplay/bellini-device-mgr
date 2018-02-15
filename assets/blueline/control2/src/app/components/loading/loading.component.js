/*********************************

 File:       loading.component.js
 Function:   Appears while the app is loading
 Copyright:  Ourglass TV
 Date:       2/8/18 1:11 AM
 Author:     mkahn


 **********************************/

require( './loading.scss' );


class LoadingController {
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



    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI' ];
    }
}

export const name = 'loadingComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   LoadingController,
    controllerAs: '$ctrl',
    template:     `
<div class="curtain">
    <div class="spinner-holder">
        <div class="spinner">
            <div class="dot1"></div>
            <div class="dot2"></div>
        </div>
    </div>
    <!--<h3>$$message$$</h3>-->
</div>
`
};

export default Component


