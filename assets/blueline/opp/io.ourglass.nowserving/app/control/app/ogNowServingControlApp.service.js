app.factory('nowServing', function ($log, ogAPI, uibHelper, $timeout, $rootScope) {
	var service = {};

	$log.debug("loaded nowServing");

	service.deviceTicketNumber = "---";
	service.venueTicketNumber = "---";
	service.usingVenueData = false;

	function saveModel() {
		ogAPI.model = { ticketNumber: service.deviceTicketNumber, usingVenueData: service.usingVenueData };
		ogAPI.venueModel = { ticketNumber: service.venueTicketNumber, usingVenueData: service.usingVenueData };

		// if (service.usingVenueData) {
		savePromiseThen(ogAPI.saveVenueModel());
		// } else {
		savePromiseThen(ogAPI.saveDeviceModel());
		// }

		$rootScope.$broadcast('DATA_CHANGED', {device: ogAPI.model, venue: ogAPI.venueModel});
	}

	function savePromiseThen(savePromise) {
		savePromise.then(function (response) {
			$log.debug("Save was cool");
		})
		.catch(function (err) {
			$log.error("WTF?!?!?");
			service.deviceTicketNumber = "&*$!";
			service.venueTicketNumber = "&*$!";
		});
	}

	service.incrementTicket = function () {

		$log.debug("Increment pressed");

		var toCheck = service.usingVenueData ? service.venueTicketNumber : service.deviceTicketNumber;

		if (toCheck === '---') {

			if (service.usingVenueData) {
				service.venueTicketNumber = 1;
			} else {
				service.deviceTicketNumber = 1;
			}
		}
		else {
			if (service.usingVenueData) {
				service.venueTicketNumber += 1;
			} else {
				service.deviceTicketNumber += 1;
			}
		}
		// ogControllerModel.model.ticketNumber = service.deviceTicketNumber;

		saveModel();

	};

	service.clear = function () {

		$log.debug("Clear pressed");
		if (service.usingVenueData) {
			service.venueTicketNumber = 0;
		} else {
			service.deviceTicketNumber = 0;
		}
		// ogControllerModel.model = {ticketNumber: 0};

		saveModel();

	};

	service.setTicket = function () {

		$log.debug("Change Ticket Pressed ");
		uibHelper.stringEditModal(
			'Change Order Number',
			'Enter the new order number below.',
			service.usingVenueData ? service.venueTicketNumber : service.deviceTicketNumber,
			'order number'
		).then(function (result) {

			if (isFinite(result) && _.parseInt(result) >= 0) {

				var numberResult = _.parseInt(result);
				if (service.usingVenueData) {
					service.venueTicketNumber = numberResult;
				} else {
					service.deviceTicketNumber = numberResult;
				}
				saveModel();
			} else {
				uibHelper.dryToast("You must enter a positive number.");
			}
		}).catch(function (err) {
			$log.error(err);
		});

	};

	service.swapDataLocation = function () {
		$log.debug("Using venue data:", service.usingVenueData);
		service.usingVenueData = !service.usingVenueData;
		$rootScope.$broadcast('DATA_LOC_CHANGED', service.usingVenueData);		
		saveModel();
	};

	// service.curtainDebug = function () {
	//     var curtain = uibHelper.curtainModal('Curtain');
	//     $timeout(function () { uibHelper.dismissCurtain(); }, 5000);
	// };

	function modelChanged(newValue) {
		$log.info("Device model changed, yay!");
		service.deviceTicketNumber = newValue.ticketNumber;
	}

	function venueModelChanged(newValue) {
		$log.info("Venue model changed, yay!");
		service.venueTicketNumber = newValue.ticketNumber;
	}

	function inboundMessage(msg) {
		$log.info("New message: " + msg);
		service.ogsystem = msg;
	}

	function initialize() {

		$log.debug("initializing app and data");

		ogAPI.init({
			appName: "io.ourglass.nowserving",
			deviceModelCallback: modelChanged,
			venueModelCallback: venueModelChanged,
			messageCallback: inboundMessage,
			appType: 'mobile',
			deviceUDID: 'apple-sim-1'
		})
			.then(function (data) {

				service.deviceTicketNumber = data.device ? data.device.ticketNumber : 0;
				service.venueTicketNumber = data.venue ? data.venue.ticketNumber : 0;
				service.usingVenueData = data.device ? data.device.usingVenueData : false;

				$rootScope.$broadcast('DATA_LOADED', {
						deviceTicketNumber: service.deviceTicketNumber,
						venueTicketNumber: service.venueTicketNumber,
						usingVenueData: service.usingVenueData
					});

				$log.debug("ogAPI init complete!");
				// if ( data.venue && data.device.useVenueData ) {
				//     service.deviceTicketNumber = data.venue.ticketNumber || '??';
				// } else {
				//     service.deviceTicketNumber = data.device.ticketNumber;
				// }
			})
			.catch(function (err) {
				$log.error("Something failed: " + err);
			});


	}

	initialize();

	return service;
});