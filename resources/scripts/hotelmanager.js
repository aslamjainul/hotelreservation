'use strict';

angular.module('hotelManagerModule', []);

angular.module('hotelManagerModule').controller(
		'MainCtrl',
		function($scope) {

			$scope.updated = null;
			$scope.reservedTables = [];
			$scope.selectedTables = [];
			$scope.numberOfTables = [ 0, 1, 2 ];
			$scope.numberOfRows = [ 0, 1, 2 ];

			$scope.listOfHotels = [];

			$scope.characters = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
					'J' ];

			$scope.rows = [ 0, 1 ];
			$scope.cols = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

			var selected = [];

			$scope.newseatClicked = function(row, col, mainRow, table) {
				var columnNumber = $scope.getColumnNumber(col, table);
				var rowName = $scope.getRowName(mainRow, row);
				var seatPos = rowName + "" + columnNumber;

				console.log("Selected Seat: " + seatPos);
				var index = $scope.selectedTables.indexOf(seatPos);
				if (index != -1) {
					$scope.selectedTables.splice(index, 1)
				} else if ($scope.reservedTables.indexOf(seatPos) == -1) {
					$scope.selectedTables.push(seatPos);
				}
			}

			$scope.newgetStatus = function(row, col, mainRow, table) {
				var columnNumber = $scope.getColumnNumber(col, table);
				var rowName = $scope.getRowName(mainRow, row);
				var seatPos = rowName + "" + columnNumber;

				if ($scope.reservedTables.indexOf(seatPos) > -1) {
					if (row % 2 == 0) {
						return 'reserved';
					} else {
						return 'reservedRotated';
					}

				} else if ($scope.selectedTables.indexOf(seatPos) > -1) {
					if (row % 2 == 0) {
						return 'selected';
					} else {
						return 'selectedRotated';
					}
				}
				if (row % 2 == 1) {
					return 'rotated';
				}
			}

			$scope.getColumnNumber = function(col, table) {
				return col + (10 * table);
			}

			$scope.getRowName = function(mainRow, row) {
				return $scope.characters[(mainRow * 2) + (row)];
			}

			$scope.clearSelected = function() {
				$scope.selectedTables = [];
			}

			$scope.changeHotel = function() {
				$scope.reservedTables = [];
				$scope.updated = null;


			}

			$scope.showSelected = function() {
				if ($scope.selectedTables.length > 0) {
					$.post("/api/bookseatforhotel", {
						seats : $scope.selectedTables,
						user : 'hello'
					}, function(data, status) {

					});
					for ( var key in $scope.selectedTables) {
						$scope.reservedTables.push($scope.selectedTables[key]);
					}
					$scope.selectedTables = [];
					$scope.updated = "updated";

				} else {
					// alert("No seats selected!");
				}
			}

			$scope.init = function() {

				$.get("/api/reservedseatsforhotel", function(
						data, status) {
					data = $.parseJSON(data);
					$.each(data, function(key, val) {
						$scope.reservedTables.push(val);
						$scope.$apply(function() {

						});

					});
				});
			};

		});

angular.module('hotelManagerModule').controller('MyBookings', function($scope) {
	$scope.itemsToAdd = [];
	$scope.init = function() {

		$.get("/api/allbookings", function(data, status) {
			data = $.parseJSON(data);

			$.each(data, function(key, val) {
				$scope.itemsToAdd.push({
					user : val.user,
					seat : val.seat,
					hotel : val.hotel,
				});

				$scope.$apply(function() {

				});

			});
			$('#dataTables-example').DataTable({
				responsive : true
			});
		});
	}

});

angular.module('hotelManagerModule').controller('login', function($scope) {
	$scope.successfulLogin = null;
	$scope.failureLogin = null;
	$scope.username = '';
	$scope.password = '';
	$scope.listOfHotels = [];

	$scope.init = function() {
		// alert('hallll');
		// $.get("hotelList.html", function(data, status) {
		$.get("/api/hotels", function(data, status) {
			data = $.parseJSON(data);
			$.each(data, function(key, val) {
				$scope.listOfHotels.push(val);
				$scope.$apply(function() {
				});
			});
		});
	};
	$scope.loginUser = function() {
		if (!$scope.selectedHotel) {
			alert('choose hotel');
			return;
		}
		if ($scope.username.length < 4) {
			$("#username").focus();
			return;
		}
		if ($scope.password.length < 4) {
			$("#password").focus();
			return;
		}
		$.post("/api/hotelmanagerlogin", {
			hotel : $scope.selectedHotel,
			username : $scope.username,
			password : $scope.password
		}, function(data, status) {
			data = $.parseJSON(data);
			if (data.success) {
				$scope.successfulLogin = 'success';
				$scope.failureLogin = null;
				window.location.replace("/hotelmanager/dashboard");
			} else {

				$scope.failureLogin = 'failure';
				$scope.successfulLogin = null;
			}
			$scope.$apply(function() {

			});

		});
	}

});