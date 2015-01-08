angular.module('PivotalApp').factory('Comment', ['$resource', function($resource) {
	var paramDefaults = {
		story_id: '@story_id',
		id: '@id'
	};

	var actions = {
		query: { isArray: true }
	};

    return $resource('projects/:project_id/stories/:story_id/comments', paramDefaults, actions);
}]);
