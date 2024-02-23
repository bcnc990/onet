Highcharts.setOptions({
  lang: {
    thousandsSep: ','
  },
  chart: {
    style: {
      fontFamily: 'Open Sans'
    }
  }
});

var lines, items,
  arr_ditems = [],
  arr_data = [],
  arr_text = [],
  curr_domain, curr_element, curr_occupation,
  curr_data_bubble,
  curr_bubble_series_name = {},
  curr_bubble_series = [],
  temp, j, k,
  colorpalette1 = ["#E8D4F7", '#700CBC', '#FDED2A', '#B8AA14', '#343009'];

function pushData(dobj, things) {
  'use strict';
  dobj.push({
    'soc_code': things[0],
    'element_id': things[1],
    'element_name': things[2],
    'avg_scale': parseFloat(things[3]),
    'tot_emp': parseFloat(things[4]),
    'soc2': things[5],
    'annual_earn': parseFloat(things[6]),
    'rank_scale': things[7],
    'soc_title': things[8],
    'jobzone': parseInt(things[9]),
    'type': things[10]
  });
}

function create_dmenu (datain) {
  var i, temp = [], text;
  arr_ditems = [];
  $.each(datain, function (i, item) {
    if ((arr_ditems.indexOf(item.element_name) === -1) && (typeof(item.element_name) !== "undefined")) {
      arr_ditems.push(item.element_name);
    }
  });
  text = $.grep(arr_text, function (n,i) {
    return n.domain === curr_domain;
  });
  curr_element = arr_ditems[0];
  for (i=0; i<arr_ditems.length; i=i+1) {
    if (typeof(text[i]) !== "undefined") {
      temp.push({'element_name': arr_ditems[i], 'desc': text[i]['desc']});
    }
  };
  temp.sort(function (a,b) {
    return a.element_name < b.element_name ? -1 : 1;
  });
  $('#dmenu').empty();
  for (i in arr_ditems) {
    if (typeof(temp[i]) !== "undefined") {
    if (temp[i]['element_name'] === curr_element) {
      $('#dmenu').append(
        $('<li>').attr("class", "list-group-item active").attr("data-toggle", "list").append(
          $('<a>').attr("class", "d-element").attr("title", temp[i]['desc']).append(
            temp[i]['element_name'])
          )
       )}
       else {
         $('#dmenu').append(
           $('<li>').attr("class", "list-group-item").attr("data-toggle", "list").append(
             $('<a>').attr("class", "d-element").attr("title", temp[i]['desc']).append(
               temp[i]['element_name'])
             )
          )};
        }
      }
}

function switchDomain (filename) {
  $.get(filename, function (data, status) {
    lines = data.split('\n');
    $.each(lines, function (lineNo, line) {
      line = line.replace(/(\r\n|\n|\r)/gm, "");
      items = line.split('\t');
      if (lineNo > 0) {
        pushData(arr_data, items);
      }
    });
    create_dmenu(arr_data);
    bubbleChart(curr_element);
    $(".d-element").on('click', function () {
      curr_element = $(this).text().trim();
      bubbleChart(curr_element);
    });
  });
}

function bubbleChart(pelement) {
  curr_bubble_series = [];
  curr_data_bubble = $.grep(arr_data, function (n, i) {
    return n.element_name === pelement && n.type === "1" && n.soc2 === curr_occupation;
  });
  for (j=1; j<6; j=j+1) {
    temp = $.grep(curr_data_bubble, function (n, i) {
      return n.jobzone === j;
    });
    curr_bubble_series_name = {'name': 'Job zone ' + j, 'color': colorpalette1[j-1], 'data': []};
    $.each(temp, function (i, item) {
      curr_bubble_series_name['data'].push({'x': item.avg_scale, 'y': item.annual_earn, 'z': item.tot_emp,
        'name': item.soc_title, 'jobzone': item.jobzone, 'competency': pelement});
    })
    curr_bubble_series.push(curr_bubble_series_name);
  }
  $('#hcharts5').highcharts({
    title: {
      style: {
        color: "#696969",
        fontFamily: 'PT Serif Caption'
      },
      text: pelement + " score and earnings"
    },
    subtitle: {
      text: "Detailed occupations"
    },
    chart: {
      type: 'bubble'
    },
    xAxis: {
      title: {
        enabled: true,
        text: 'Average score'
      },
      startOnTick: true,
      endOnTick: true,
      showLastLabel: true
    },
    yAxis: {
      title: {
        text: 'Annual earnings'
      }
    },
    legend: {
      enabled: true
    },
    plotOptions: {
      series: {
        stickyTracking: false
      }
    },
    tooltip: {
      headerFormat: '<b>{series.name}</b><br>',
      pointFormat: '{point.name}: <br> <br>Competency: {point.competency} <br> Score: {point.x: .1f} <br>Annual earnings: ${point.y} <br> Total employment: {point.z}'
    },
    series: curr_bubble_series,
    credits: {
      enabled: false
    }
  });
}

$(document).ready(function () {
  'use strict';

  $.get("ContentModel_DetailedDesc_group.txt", function (data, status) {
    lines = data.split('\n');
    $.each(lines, function (lineNo, line) {
      line = line.replace(/(\r\n|\n|\r)/gm, "");
      line = line.replace(/"/gm,"");
      items = line.split('\t');
      if (lineNo > 0) {
        arr_text.push({'domain': items[0], 'element_id': items[1], 'element_name': items[2], 'desc': items[3]});
      }
    });

    $.get('abilities_earn.tsv', function (data, status) {
      lines = data.split('\n');
      $.each(lines, function (lineNo, line) {
        line = line.replace(/(\r\n|\n|\r)/gm, "");
        items = line.split('\t');
        if (lineNo > 0) {
          pushData(arr_data, items);
        }
      });

      //Initialize
      curr_domain = 'Abilities';
      curr_occupation = 'Management';
      create_dmenu(arr_data);
      bubbleChart(curr_element);

      $(".d-element").on('click', function () {
        curr_element = $(this).text().trim();
        bubbleChart(curr_element);
      });
      $(".domain-list").on('click', function () {
        curr_domain = $(this).text().trim();
        arr_data = [];
        if (curr_domain === "Knowledge") {
          switchDomain("knowledge_earn.tsv");
        } else if (curr_domain === "Skills") {
          switchDomain("skills_earn.tsv");
        } else if (curr_domain === "Work activities") {
          switchDomain("activities_earn.tsv");
        } else if (curr_domain === "Work context") {
          switchDomain("context_earn.tsv");
        } else if (curr_domain === "Work styles") {
          switchDomain("styles_earn.tsv");
        } else if (curr_domain === "Abilities") {
          switchDomain("abilities_earn.tsv");
        };
      });
      $(".occ-list").on('click', function () {
        curr_occupation = $(this).text().trim();
        bubbleChart(curr_element);
      });

      // console.log(curr_data_bar);
      // console.log(curr_scatter_series);
      // console.log(arr_data);
    });
  });
});
