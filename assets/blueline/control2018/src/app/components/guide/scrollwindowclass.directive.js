/**
 *
 *
 * NOT CURRENTLY USED!!!
 *
 *
 *
 */


export default class ScrollWindow {

    constructor($log) {
        this.$log = $log;
        this.restrict = 'A';
        // TODO should I bail on scope and bidi linkage?
        this.scope = { edgeCallback: '=', limits: '=' };

    }

    link( scope, element, attrs ){

        const myElement = element[ 0 ];
        const kickback = attrs.kickback || myElement.offsetHeight / 4;

        let edge;
        const developmentMode = false;

        this.$log.debug( 'inside scroller windower' );


        // scrollTop = distance content has scrolled. 0 means "at top"
        // offsetHeight = on-screen height of element including border and padding (no margin)
        // scrollHeight = read-only property is a measurement of the height of an element's content,
        // including content not visible on the screen due to overflow. This is how tall the scroller
        // would need to be to fit on-screen without a scroll bar.
        //
        // In the downwards direction, scrollTop can never get to scrollHeight because the formula
        // works like so:
        //                              scrollTop---v
        //                                          |<---- offsetHeight -----|
        // |<----------------------------- scrollHeight -------------------->|
        //
        // So to trigger a load at the bottom, you need to do it no later than:
        //    scrollTop = scrollHeight - offsetHeight  (minus a little guardband)

        element.bind( 'scroll', function () {

            if ( developmentMode ) {
                this.$log.debug( 'scrollHeight - ' + myElement.scrollHeight );
                this.$log.debug( 'offsetHeight - ' + myElement.offsetHeight );
                this.$log.debug( 'scrollTop - ' + myElement.scrollTop );
                this.$log.debug( 'Bottom trigger: ' + (myElement.scrollHeight - kickback / 2) );
            }

            if ( myElement.scrollTop === 0 && !scope.limits.top ) {
                edge = 'top';
                this.$log.debug( "At top" );
                myElement.scrollTop = myElement.scrollTop + kickback;
                edgeCb();
            } else if ( myElement.scrollTop > (myElement.scrollHeight - myElement.offsetHeight - kickback / 2) && !scope.limits.bottom ) {
                edge = 'end';
                this.$log.debug( "At end" );
                myElement.scrollTop = myElement.scrollTop - kickback;
                edgeCb();
            }

        } );

        function edgeCb() {
            if ( scope.edgeCallback ) {

                scope.$apply( function () {

                    scope.edgeCallback( edge );

                } );

            }
        }
    }


    static get $name$() {
        return 'scrollWindow';
    }

}