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
			service.useVenueData = data.useVenueData;
			if (data.useVenueData && service.messages.length == 0) { //We want to wait for venue information at this point
				service.messages = [];
				service.comingUpMessages = [];
				service.twitterQueries = [];
				service.hideTVTweets = true;
				$rootScope.$broadcast('UPDATE');
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

			service.useVenueData = true;
			service.hideTVTweets = data.hideTVTweets;

			$rootScope.$broadcast('UPDATE');			
			// $rootScope.$broadcast('UPDATE', {
			// 		messages: 	service.messages,
			// 		hideTVTweets: service.hideTVTweets,
			// 		twitterQueries: service.twitterQueries
			// 	});
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
				data.useVenueData ? venueModelUpdate(data.venue) : deviceModelUpdate(data.device);
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

		service.swapDataLocation = function () {
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

			var whatData = service.useVenueData ? 'venueModel' : 'model';
			ogAPI.model.useVenueData = service.useVenueData; //These need to always be synced
			ogAPI.venueModel.useVenueData = service.useVenueData; //These need to always be synced			

			ogAPI[whatData].messages = service.messages;
			ogAPI[whatData].comingUpMessages = service.comingUpMessages;

			ogAPI[whatData].twitterQueries = service.twitterQueries;
			ogAPI[whatData].hideTVTweets = service.hideTVTweets;

			if (service.useVenueData === true && ogAPI[whatData].useVenueData) { //If we use venue data
				afterOGAPISave(ogAPI.saveDeviceModel()); //Save that we are using venueData to the deviceModel
			} 
			uibHelper.curtainModal('Saving...');

			if (service.useVenueData) {
				afterOGAPISave(ogAPI.saveVenueModel());
			} else {
				afterOGAPISave(ogAPI.saveDeviceModel());
			}
		};

		function afterOGAPISave(savePromise) {
			var whatData = service.useVenueData ? 'venueModel' : 'model';			
			savePromise.then(function () {
				return ogAPI.updateTwitterQuery(ogAPI[whatData].twitterQueries);
			}).finally(function () { 
				uibHelper.dismissCurtain();
				$rootScope.$broadcast('UPDATE');
			});
		}

		service.toggleTVTweets = function () {
			$log.debug("Toggling tweets");
			service.hideTVTweets = !service.hideTVTweets;
			$rootScope.$broadcast('UPDATE');
		};

		initialize();


		return service;

	});
