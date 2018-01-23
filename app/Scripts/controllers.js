'use strict';
// Declare app level module which depends on views, and components
var seriesOptions = [],
  seriesCounter = 0,
  names = ['facebook', 'twitter', 'instagram', 'youtube'];


angular.module('chartmetricApp').
controller('SearchController', ['$scope', '$http', function($scope, $http) {

  $scope.search = function() {
    seriesCounter = 0;
    seriesOptions = [];
    var req = {
      method: 'GET',
      url: 'https://api.chartmetric.io/api/search?q=' + $scope.searchText,
      headers: {
        'Authorization': 'Bearer ' + $scope.token
      }
    };

    $http(req).then(function successCallback(response) {
        $scope.artistDetails = response.data.obj.artist[0];
        console.log($scope.artistDetails);
        $scope.isArtistImageVisible = true;
        $scope.makeGraph($scope.artistDetails);
      },

      function errorCallback(response) {
        if (response.status == 401) {
          $http.get('https://api.chartmetric.io/api/token?refreshtoken=RzLoIs1qtruXM0froUglDQsAgYWk4m6Ps6hh9Fn4Y7wiNnDe86fVIhIlEuNr1chG')
            .then(function(response) {
              $scope.token = response.data.obj;
              $scope.search();
            })
        } else {
          console.log(response);

        }
      }
    )
  }

  $scope.makeGraph = function(artist) {
    var socialMediaReq = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + $scope.token
      }
    };
    var arr = [], socialMediaFollowers = [];
    var socialMedia = ['facebook', 'twitter', 'instagram', 'youtube'];
    for (var i = 0; i < socialMedia.length; i++) {
      socialMediaReq.url = 'https://api.chartmetric.io/api/artist/' + artist.id + '/stat/' + socialMedia[i] + '?since=2016-12-20';
        $http(socialMediaReq).then(function successCallback(response) {
        socialMediaFollowers[i] = response.data.obj;
        createChart(socialMediaFollowers[i], i);
    });
    }
}


  /**
   * Create the chart when all data is loaded
   * @returns {undefined}
   */
  function createChart(socialMediaFollowers, i) {
    /*THIS CAN BE IMPROVED UPON??????? */
    var data = [];
    for (var j = 0; j < socialMediaFollowers.length; j++) {
      var date = new Date(socialMediaFollowers[j].timestp);
      data[j] = [date.getTime(), socialMediaFollowers[j].value];
    }

    seriesOptions[seriesCounter] = {
      name: names[seriesCounter],
      data: data
    };

    // As we're loading the data asynchronously, we don't know what order it will arrive. So
    // we keep a counter and create the chart when all the data is loaded.
    seriesCounter += 1;
    //Once all social media data is loaded:
    if (seriesCounter === names.length) {
      Highcharts.stockChart('container', {
        rangeSelector: {
          selected: 4
        },

        xAxis: {
          type: 'datetime',

          labels: {
            format: '{value:%Y-%b-%e}'
          }
        },


        yAxis: {
          labels: {
            formatter: function() {
              return (this.value > 0 ? ' + ' : '') + this.value + '%';
            }
          },
          plotLines: [{
            value: 0,
            width: 2,
            color: 'silver'
          }]
        },

        plotOptions: {
          series: {
            compare: 'percent',
            showInNavigator: true
          }
        },

        tooltip: {
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
          valueDecimals: 2,
          split: true
        },

        series: seriesOptions
      });
    }
  }
}]);
