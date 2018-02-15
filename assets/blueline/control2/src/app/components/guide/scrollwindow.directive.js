
export default function ScrollWindow($log) {

    return {
        restrict: 'A',
        scope: { edgeCallback: '=', limits: '=' },

        link: function( scope, element, attrs ){

            const myElement = element[ 0 ];
            const kickback = attrs.kickback || myElement.offsetHeight / 4;

            let edge;
            const developmentMode = false;

            $log.debug( 'inside scroller windower' );


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
                    $log.debug( 'scrollHeight - ' + myElement.scrollHeight );
                    $log.debug( 'offsetHeight - ' + myElement.offsetHeight );
                    $log.debug( 'scrollTop - ' + myElement.scrollTop );
                    $log.debug( 'Bottom trigger: ' + (myElement.scrollHeight - kickback / 2) );
                }

                if ( myElement.scrollTop === 0 && !scope.limits.top ) {
                    edge = 'top';
                    $log.debug( "At top" );
                    myElement.scrollTop = myElement.scrollTop + kickback;
                    edgeCb();
                } else if ( myElement.scrollTop > (myElement.scrollHeight - myElement.offsetHeight - kickback / 2) && !scope.limits.bottom ) {
                    edge = 'end';
                    $log.debug( "At end" );
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

    }


}