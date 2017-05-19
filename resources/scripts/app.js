'use strict';

angular.module('seatReservationApp', []);

angular.module('seatReservationApp').controller(
		'MainCtrl',
		function($scope) {

			// $scope.reservedTables = ['A2', 'A3', 'B5', 'C6', 'C7',
			// 'C8', 'J1', 'J2', 'J3', 'J4'];
			// var items = [];
			$scope.updated = null;
			$scope.reservedTables = [];
			$scope.selectedTables = [];
			$scope.selectedHotel = null;
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
				// alert('hotel -- '+$scope.selectedHotel);
				$scope.reservedTables = [];
				$scope.updated = null;

				// $.get($scope.selectedHotel+".html",
				$.get("/api/reservedseats/" + $scope.selectedHotel, function(
						data, status) {
					data = $.parseJSON(data);
					$.each(data, function(key, val) {
						$scope.reservedTables.push(val);
						$scope.$apply(function() {

						});

					});
				});

			}

			$scope.showSelected = function() {
				if ($scope.selectedTables.length > 0) {
					// $.post("http://appserver-jainulaslamcoda.1d35.starter-us-east-1.openshiftapps.com/customer/bookseat",
					// {
					$.post("/api/bookseat", {
						seats : $scope.selectedTables,
						hotel : $scope.selectedHotel,
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
				/*
				 * $.get("aslam.html", // $.get("/customer/getreservedseats/" +
				 * $scope.selectedHotel, function(data, status) { data =
				 * $.parseJSON(data); $.each(data, function(key, val) {
				 * $scope.reservedTables.push(val); $scope.$apply(function() {
				 * 
				 * });
				 * 
				 * }); });
				 */

				// $.get("hotel.html",
				$.get("/api/hotels", function(data, status) {
					data = $.parseJSON(data);
					$.each(data, function(key, val) {
						$scope.listOfHotels.push(val);
						$scope.$apply(function() {

						});

					});
				});

			};

		});

angular.module('seatReservationApp').controller('MyBookings', function($scope) {
	$scope.itemsToAdd = [];
	$scope.init = function() {

		$.get("/api/mybookings", function(data, status) {
		//$.get("mybookings.html", function(data, status) {
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