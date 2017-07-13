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
    controller: function ( $timeout, $http, toastr, $log ) {

        var ctrl = this;
        console.log(ctrl);

        this.crawlerPos = function () {
            return (ctrl.crawler.pos !== 0) ? 'cpos-top' : 'cpos-bot';
        }

        this.widgetPos = function () {
            return 'wpos-' + (ctrl.widget.pos + 1);
        }

        this.$onInit = function () {
            $log.debug("on init()");
        }

            
// ng-init="$ctrl.crawlerHeight = $ctrl.getHeight($ctrl.crawler.src)"  FAILURE LINES
// ng-init="$ctrl.widgetHeight = $ctrl.getHeight($ctrl.widget.src)"    FAILURE LINES
    },
    template:   `
        <div class="tvframe">
            <video class="simvid" autoplay loop>
                <source src="{{ $ctrl.vid }}" type="video/mp4">
            </video>
            <iframe class="crawler" ng-style="{'height': $ctrl.crawler.height  + '%'}" ng-class="$ctrl.crawlerPos()" src="{{ $ctrl.crawler.src }}" scrolling="no"></iframe>
            <iframe class="widget"  ng-style="{'height': $ctrl.widget.height + '%'}"  ng-class="$ctrl.widgetPos()" src="{{ $ctrl.widget.src }}" scrolling="no"></iframe>
        </div>
    
    `
} );