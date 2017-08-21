/**
 * Created by mkahn on 4/28/15.
 */

app.factory("ogCrawler",
	function (ogAPI, uibHelper, $log, $rootScope) {


		var service = {};

		service.messages = [];
		service.comingUpMessages = [];
		service.twitterQueries = [];
		service.ui = { tab: "MESSAGES" };

		service.tabs = ['Messages', 'Coming Up', 'Twitter'];

		service.getSelectedTabTitle = function () {
			return service.tabs[$ionicTabsDelegate.selectedIndex()];
		};

		service.getTabURI = function (tab) {
			return tab.toLowerCase().replace(' ', '');
		};
		function deviceModelUpdate(data) {

			if (data.useVenueDataModel && service.messages.length == 0) { //We want to wait for venue information at this point
				service.messages = [];
				service.comingUpMessages = [];
				service.twitterQueries = [];
				service.hideTVTweets = true;
				return;
			}

			if (data.messages && data.messages.length != service.messages.length) {
				service.messages = data.messages || [];
			}
			if (data.comingUpMessages && data.comingUpMessages.length != service.comingUpMessages.length) {
				service.comingUpMessages = data.comingUpMessages || [];
			}
			if (data.twitterQueries && data.twitterQueries.length != service.twitterQueries.length) {
				service.twitterQueries = data.twitterQueries || [];
			}

			service.hideTVTweets = data.hideTVTweets;

			$rootScope.$broadcast('UPDATE');
		}

		function venueModelUpdate(data) {
			if (data.messages && data.messages.length != service.messages.length) {
				service.messages = data.messages || [];
			}
			if (data.comingUpMessages && data.comingUpMessages.length != service.comingUpMessages.length) {
				service.comingUpMessages = data.comingUpMessages || [];
			}
			if (data.twitterQueries && data.twitterQueries.length != service.twitterQueries.length) {
				service.twitterQueries = data.twitterQueries || [];
			}

			service.hideTVTweets = data.hideTVTweets;

			$rootScope.$broadcast('UPDATE');
		}

		function inboundMessage(msg) {
			$log.info("New message: " + msg);
		}

		function initialize() {

			ogAPI.init({
				appType: 'mobile',
				appName: "io.ourglass.ogcrawler",
				endpoint: "control",
				deviceUDID: "test",
				deviceModelCallback: deviceModelUpdate,
				venueModelCallback: venueModelUpdate,
				messageCallback: inboundMessage
			})
				.then(function (data) {
					$log.debug("crawler control: init complete");
					// deviceModelUpdate(data);
					data.useVenueData ? venueModelUpdate(data) : deviceModelUpdate(data);
				})
				.catch(function (err) {
					$log.error("crawler controller: something bad happened: " + err);
				});
		}

		service.newMessage = function () {
			service.messages.push("");
			service.update();
		};

		service.newComingUpMessage = function () {
			service.comingUpMessages.push("");
			service.update();
		};

		service.newTwitterQuery = function () {
			service.twitterQueries.push("");
			//service.update();
		};

		service.delMessage = function (index) {
			service.messages.splice(index, 1);
			service.update();
		};

		service.swapDataLocation = function (index) {
			service.useVenueData = !service.useVenueData;
			service.update();
		};

		service.delComingUpMessage = function (index) {
			service.comingUpMessages.splice(index, 1);
			service.update();
		};

		service.delTwitterQuery = function (index) {
			service.twitterQueries.splice(index, 1);
			service.update();
		};

		service.update = function () {
			ogAPI.model.messages = service.messages;
			ogAPI.model.comingUpMessages = service.comingUpMessages;

			ogAPI.model.twitterQueries = service.twitterQueries;
			ogAPI.model.hideTVTweets = service.hideTVTweets;

			if (service.useVenueData === true && ogAPI.model.useVenueData) { //If we use venue data

				ogAPI.saveDeviceModel(); //Save that we are using venueData to the deviceModel

				delete ogAPI.model.useVenueData; //Delete it before we save to venueModel

			} else { //If we don't use venue data
				ogAPI.model.useVenueData = false;
			}

			uibHelper.curtainModal('Saving...');

			if (service.useVenueData) {
				afterOGAPISave(ogAPI.saveVenueModel());
			} else {
				afterOGAPISave(ogAPI.saveDeviceModel());
			}
		};

		function afterOGAPISave(savePromise) {
			savePromise.then(function () {
				return ogAPI.updateTwitterQuery(ogAPI.model.twitterQueries);
			}).finally(function () { 
				uibHelper.dismissCurtain();
				$rootScope.$broadcast('UPDATE');
			});
		}

		service.toggleTVTweets = function () {
			$log.debug("Toggling tweets");
			service.hideTVTweets = !service.hideTVTweets;
		};

		initialize();


		return service;

	});
