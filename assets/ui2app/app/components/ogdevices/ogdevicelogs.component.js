/**
 * Created by mkahn on 8/17/17.
 */

app.component( 'ogDeviceLogs', {

    bindings:   {
        device: '<'
    },
    controller: function ( toastr, $log, sailsOGLogs ) {

        var ctrl = this;

        ctrl.$onInit = function(){
            sailsOGLogs.getAll( 'limit=50&sort=createdAt DESC&deviceUDID=' + this.device.deviceUDID )
                .then( ( logs ) => {
                    ctrl.logs = logs;
                } )
                .catch( ( err ) => toastr.error( err.message ) );
        }

        ctrl.showLog = function(log){

            ctrl.viewLog = log;
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
<h3>Device Logs</h3>        
<p class="info-bubble">{{ $ctrl.device.deviceUDID }}</p>
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
        <button ng-click="$ctrl.showLog()">CLOSE</button>
        <pre>{{ $crtl.viewLog | json  }}</pre>
    </div>
     
</div>
    
    `


} );