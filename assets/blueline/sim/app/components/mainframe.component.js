/*********************************

 File:       mainframe.component.js
 Function:   Simulates the Mainframe Activity from Bucanero
 Copyright:  Ourglass TV
 Date:       5/19/17 8:53 AM
 Author:     mkahn

 **********************************/

app.component( 'mainFrame', {

    bindings:   {
        crawler: '<',
        widget:  '<',
        vid:     '<'
    },
    controller: function ( toastr, $log ) {

        var ctrl = this;


        this.crawlerPos = function () {
            return (ctrl.crawler.pos === 0) ? 'cpos-top' : 'cpos-bot';
        }

        this.widgetPos = function () {
            return 'wpos-' + (ctrl.widget.pos + 1);
        }

        this.$onInit = function () {
            $log.debug( "on init()" );
        }


    },
    template:   `
        <div class="tvframe">
            <video class="simvid" autoplay loop>
                <source src="{{ $ctrl.vid }}" type="video/mp4">
            </video>
            <iframe class="crawler" ng-class="$ctrl.crawlerPos()" src="{{ $ctrl.crawler.src }}" scrolling="no"></iframe>
            <iframe class="widget" ng-class="$ctrl.widgetPos()" src="{{ $ctrl.widget.src }}" scrolling="no"></iframe>

        </div>
    
    `
} );