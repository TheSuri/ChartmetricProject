'use strict';
// Declare app level module which depends on views, and components
var seriesOptions = [],
  seriesCounter = 0,
  names = ['facebook', 'twitter', 'instagram', 'youtube'];


angular.module('chartmetricApp').
controller('SearchController', ['$scope', '$http', function($scope, $http) {

  $scope.search = function() {
    console.log("in search");
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
              //console.log($scope.token);
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
      //url: 'https://api.chartmetric.io/api/artist/'+artist.id+'/stat/facebook?since=2017-12-20',
      headers: {
        'Authorization': 'Bearer ' + $scope.token
      }
    };
    var socialMediaFollowers = [];
    var socialMedia = ['facebook', 'twitter', 'instagram', 'youtube'];
    for (var i = 0; i < socialMedia.length; i++) {
      socialMediaReq.url = 'https://api.chartmetric.io/api/artist/' + artist.id + '/stat/' + socialMedia[i] + '?since=2016-12-20';
      $http(socialMediaReq).then(function successCallback(response) {
        socialMediaFollowers[i] = response.data.obj;
        createChart(socialMediaFollowers[i], i);
        //console.log(socialMediaFollowers[i]);
      })
    }
  }


  /**
   * Create the chart when all data is loaded
   * @returns {undefined}
   */
  function createChart(socialMediaFollowers, i) {
    console.log(socialMediaFollowers);


    console.log(seriesCounter);
    //  for (var i = 0; i < names.length; i++) {
    //$.each(names, function (i, name) {

    //$.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=' + name.toLowerCase() + '-c.json&callback=?',    function (data) {
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

    if (seriesCounter === names.length) {
      //console.log("Sereiesoption[0] " + seriesOptions[0] + " Sereiesoption[1] " + seriesOptions[1]+ " seriesOptions[2] "+ seriesOptions[2] );
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
