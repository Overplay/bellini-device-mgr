/**
 * Created by mkahn on 8/17/17.
 */

app.component( 'ogDeviceSocketIo', {

    bindings:   {
        device: '<'
    },
    controller: function ( $scope, toastr, $log, $timeout, belliniDM ) {

        var ctrl = this;

        let pingWaitPromise, identWaitPromise, txWaitPromise;
        let pingStartTime = 0;

        ctrl.pingResponse = { response: "waiting to ping" };
        ctrl.identResponse = {};
        ctrl.txResponse = {};


        ctrl.deviceClientRoomStatus = {
            roomJoined: false,
            rxMessages: []
        };

        io.socket.on( 'DEVICE-DM', function ( data ) {
            $scope.$apply( function () {
                receivedDirectMessage( data );
            } );
        } );

        function receivedDirectMessage( data ) {
            $log.debug( 'Message rx for ' + JSON.stringify( data ) );

            if (txWaitPromise){
                $log.debug("Outstanding txWaitPromise, we we assume this data is meant for the generic TXer.");
                $timeout.cancel(txWaitPromise);
                txWaitPromise = null;
                ctrl.txResponse = data;
                return;
            }

            switch (data.action){

                case "ping-ack":
                    ctrl.pingResponse = { response: 'PING ACKed in ' + (new Date().getTime() - pingStartTime) + 'ms' };
                    $timeout.cancel( pingWaitPromise );
                    break;

                case "ident-ack":
                    ctrl.identResponse = data.payload;
                    $timeout.cancel( identWaitPromise );
                    break;

                default:
                    $log.debug("Unhandled action: "+data.action);
            }

        }

        ctrl.joinDeviceClientRoom = function() {

            $log.debug('Joining device client room.');

            io.socket.post( '/ogdevice/joinclientroom', { deviceUDID: this.device.deviceUDID },
                function gotResponse( data, jwRes ) {
                    if ( jwRes.statusCode !== 200 ) {
                        $log.error( "Could not connect to device client room!!!" );
                    } else {
                        $log.debug( "Successfully joined device client room for this device" );
                        $scope.$apply(()=>{ctrl.deviceClientRoomStatus.roomJoined = true;})
                    }
                } );
        }

        ctrl.ping = function () {
            ctrl.pingResponse = { response: "ISSUING PING..." };
            pingStartTime = new Date().getTime();

            belliniDM.messageToDevice(ctrl.device.deviceUDID,
                { action: 'ping', payload: 'Ping me back, bro!' })
                .then(()=>{
                    toastr.success( "Ping Issued" );
                    pingWaitPromise = $timeout( () => {
                        ctrl.pingResponse = { response: "No response in 5 seconds." };
                    }, 5000 );
                    })
                .catch((error)=>{
                    ctrl.pingResponse = { response: "PING FAILED to connect to Bellini!" };
                    toastr.error( error.message, "Could not issue ping!" );
                });


        };

        ctrl.identify = function () {
            ctrl.identResponse = {};

            belliniDM.messageToDevice( ctrl.device.deviceUDID,
                { action: 'identify' } )
                .then( () => {
                    toastr.success( "Ident Issued" );
                    identWaitPromise = $timeout( function () {
                        $log.error( "No ident response in 5 second window!" );
                        ctrl.identResponse = { error: "No response in 5 seconds." };
                    }, 5000 );
                } )
                .catch( ( error ) => {
                    ctrl.identResponse = { response: "IDENT FAILED to connect to Bellini!" };
                    toastr.error( error.message, "Could not issue ident!" );
                } );

        };

        ctrl.tx2og = function () {
            ctrl.txResponse = {};

            belliniDM.messageToDevice( ctrl.device.deviceUDID,
                JSON.parse(ctrl.txJson) )
                .then( () => {
                    toastr.success( "TX Message Issued" );
                    txWaitPromise = $timeout( function () {
                        $log.error( "No tx response in 5 second window!" );
                        ctrl.txResponse = { error: "No response in 5 seconds." };
                    }, 5000 );
                } )
                .catch( ( error ) => {
                    ctrl.txResponse = { response: "TX FAILED to connect to Bellini!" };
                    toastr.error( error.message, "Could not issue tx!" );
                } );

        };

        ctrl.$onInit = function(){
            ctrl.joinDeviceClientRoom();
        }

        ctrl.tryParseJSON = function ( jsonString ){
            try {
                const o = JSON.parse( jsonString );
                if ( o && typeof o === "object" ) {
                    return o;
                }
            }
            catch ( e ) {
            }

            return false;
        };


    },

    template: `

<div>
        
                <!------- ROOM STATUS ------------>
                <div style="margin-top: 10px; display: flex; padding: 10px; background-color: #ECE9E9">
                    <div style="color: white; width: 100%; padding: 10px; border-radius: 5px;" 
                        ng-style="{ 'background-color': $ctrl.deviceClientRoomStatus.roomJoined ? '#34a681' : 'red'  }">
                        <h4>{{ $ctrl.deviceClientRoomStatus.roomJoined ? "Client room is connected" : "Client room is NOT connected" }}
                          <button class="btn btn-success pull-right" ng-if="!$ctrl.deviceClientRoomStatus.roomJoined"
                        ng-click="$ctrl.joinDeviceClientRoom()">JOIN CLIENT ROOM</button> 
                        </h4>
                     
                    </div>
                    
                </div>
                
            
                
                <!------- PING ------------>
                <div style="margin-top: 10px; display: flex; padding: 10px; background-color: #ECE9E9">
                    <div style="flex:1; margin-right: 10px;">
                        <button class="btn btn-success" style="width: 100%;" ng-click="$ctrl.ping()">PING</button>
                    </div>
                    <div style="flex: 4;">
                        <pre>{{ $ctrl.pingResponse.response }}</pre>
                    </div>
                </div>
                
                <!-------- IDENT ---------->
                <div style="margin-top: 10px; display: flex; padding: 10px; background-color: #ECE9E9">
                    <div style="flex:1; margin-right: 10px;">
                        <button class="btn btn-success" style="width: 100%;" ng-click="$ctrl.identify()">IDENTIFY</button>
                    </div>
                    <div style="flex: 4;">
                        <pre>{{ $ctrl.identResponse | json }}</pre>
                    </div>
                </div>
                
                 <!-------- TX 2 BOX ---------->
                <div style="margin-top: 10px; display: flex; padding: 10px; background-color: #ECE9E9">
                    <div style="flex:1; margin-right: 10px;">
                        <button class="btn btn-success" style="width: 100%;" 
                                ng-click="$ctrl.tx2og()" ng-disabled="!$ctrl.tryParseJSON($ctrl.txJson)">TX 2 OG</button>
                    </div>
                    <div style="flex: 4;">
                        <!--<div class="form-group">-->
                            <label for="txJson">JSON to Send (must be quoted JSON)</label>
                            <textarea id="txJson" class="form-control" type="text" ng-model="$ctrl.txJson" placeholder="JSON"></textarea>
                        <!--</div>-->
                        <label for="txresponse">Response</label>
                         <pre id="txresponse">{{ $ctrl.txResponse | json }}</pre><br>
                         <p>Note: actions sent to an OG box are of the form:</p>
                         <code>{ "action" : "ACTION_NAME", ... }</code>
                         <p style="margin-top: 5px;">Only the <code>action</code> field is required.</p>
                    </div>
                </div>
                                     

        </div>
    
    `


} );