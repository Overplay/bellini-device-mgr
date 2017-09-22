/**
 * Created by mkahn on 8/17/17.
 */

app.component( 'ogDeviceLogs', {

    bindings:   {
        device: '<'
    },
    controller: function ( toastr, $log, sailsOGLogs ) {

        var ctrl = this;

        ctrl.getAll = false;

        function getQuery() {
            return ctrl.getAll ? 'sort=createdAt DESC&deviceUDID=' + ctrl.device.deviceUDID :
                'limit=50&sort=createdAt DESC&deviceUDID=' + ctrl.device.deviceUDID;
        }

        function loadLogs(){
            sailsOGLogs.getAll( getQuery() )
                .then( ( logs ) => {
                    ctrl.logs = logs;
                } )
                .catch( ( err ) => toastr.error( err.message ) );
        }

        ctrl.$onInit = function(){
            loadLogs()
        }

        ctrl.showLog = function(log){

            if (log.logType==='logcat'){
                ctrl.viewLog = log.message.logcat;
            } else {
                ctrl.viewLog = log;
            }
        }

        ctrl.loadToggle = function(){
            ctrl.getAll = !ctrl.getAll;
            loadLogs();
        }
        // Logs are NOT posted thru the blueline methods, so ws updates will be a little more involved!

        // io.socket.on( 'oglog', function ( event ) {
        //     console.log( event );
        //
        // } );
        //
        // //subscribe to models
        // io.socket.get( '/oglog?limit=1', function ( resData, jwres ) {console.log( resData );} );

    },

    template: `

<div>
<h3>Device Logs<button class="btn btn-success pull-right" ng-click="$ctrl.loadToggle()">{{ $ctrl.getAll ? "Load last 50" : "Load all" }}</button> </h3>        
<p class="info-bubble top15">{{ $ctrl.device.deviceUDID }}</p>
   <input type="text" ng-model="searchTerm" class="form-control" placeholder="Search...">

   <table class="table" ng-if="!$ctrl.viewLog && $ctrl.logs.length">
    <tr>
     <th>Time</th>
     <th>Type</th>
    </tr>
    <tr ng-repeat="l in $ctrl.logs | filter:searchTerm">
        <td>{{ l.loggedAt }}</td>
        <td><button class="btn btn-sm btn-success" ng-click="$ctrl.showLog(l)">{{ l.logType }}</button></td>
    </tr>
    </table>
    <div ng-if="$ctrl.viewLog">
        <button ng-click="$ctrl.viewLog = false" class="btn btn-success top15">CLOSE</button>
        <pre>{{ $ctrl.viewLog }}</pre>
    </div>
     
</div>
    
    `


} );