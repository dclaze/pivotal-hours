angular.module('PivotalApp', ['ngResource']);

angular.module('PivotalApp').config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push(function() {
        var baseUrl = "https://www.pivotaltracker.com/services/v5/";
        return {
            request: function(request) {
                request.url = baseUrl + request.url;
                return request;
            }
        };
    });
}]);

angular.module('PivotalApp').controller('Main', ['$scope', '$http', 'Story', 'Task', function($scope, $http, Story, Task) {
    $scope.tasksOnly = false;
    var loadMembers = function() {
        $http.get('projects/' + $scope.projectId + '/memberships', {}).success(function(response) {
            $scope.members = response;
        });
    };

    var init = function() {
        $scope.token = localStorage.getItem("token");
        $scope.projectId = localStorage.getItem("projectId");
        $http.defaults.headers.common["X-TrackerToken"] = $scope.token;
        if ($scope.projectId)
            loadMembers();
    };
    init();

    $scope.updateToken = function(token) {
        localStorage.setItem("token", token);
        $http.defaults.headers.common["X-TrackerToken"] = $scope.token;
    };

    $scope.updateProjectId = function(projectId) {
        localStorage.setItem("projectId", projectId);
    };

    $scope.$watch('member.person.id', function(personId) {
        if(personId)
            $scope.stories = Story.query({
                projectId: $scope.projectId,
                filter: "owner:"+$scope.member.person.id
            });
        else
            $scope.stories = [];
    });

    $scope.getSumOfCompletedHours = function() {
        return ($scope.stories || [])
            .map(function(s) { return s.getCompletedTaskTotal(); })
            .reduce(function(a, b) {return a + b;}, 0);
    };

    $scope.getTotalHours = function() {
        return ($scope.stories || [])
            .map(function(s) {return s.getTaskTotal(); })
            .reduce(function(a, b) {return a + b;}, 0);
    };
}]);
