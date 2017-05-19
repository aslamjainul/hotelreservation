'use strict';

angular.module('adminModule', []);

angular.module('adminModule').controller('registration',
		function($scope) {
			$scope.successfulRegistration = null;
			$scope.failureRegistration = null;
			$scope.username = '';
			$scope.password = '';
			$scope.hotel = '';
			$scope.registerUser = function() {

				if ($scope.hotel.length < 4) {
					$("#hotel").focus();
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
				// alert($scope.username+" -- "+$scope.password)
				$.post("/api/addhotel", {
					hotel : $scope.hotel,
					username : $scope.username,
					password : $scope.password
				}, function(data, status) {
					// $.get("loginresult.html", function(data, status) {
					data = $.parseJSON(data);
					if (data.success) {
						$scope.successfulRegistration = 'success';
						$scope.failureRegistration = null;
					} else {

						$scope.failureRegistration = 'failure';
						$scope.successfulRegistration = null;
					}
					$scope.$apply(function() {

					});

				});
			}

		});