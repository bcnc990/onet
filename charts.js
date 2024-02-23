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
  curr_domain, curr_element,
  curr_data_scatter, curr_data_bar, curr_data_scatter2,
  curr_xcat = [],
  curr_scatter_series_name = {}, curr_scatter2_series_name = {}, curr_bar_series_name = {},
  curr_scatter_series = [], curr_scatter2_series = [], curr_bar_series = [],
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
    scatterChart(curr_element);
    barChart(curr_element);
    scatterChart2(curr_element);
    $(".d-element").on('click', function () {
      curr_element = $(this).text().trim();
      scatterChart(curr_element);
      barChart(curr_element);
      scatterChart2(curr_element);
    });
  });
}

function scatterChart(pelement) {
  curr_scatter_series = [];
  curr_data_scatter = $.grep(arr_data, function (n, i) {
    return n.element_name === pelement && n.type === "1";
  });
  for (j=1; j<6; j=j+1) {
    temp = $.grep(curr_data_scatter, function (n, i) {
      return n.jobzone === j;
    });
    curr_scatter_series_name = {'name': 'Job zone ' + j, 'color': colorpalette1[j-1], 'data': []};
    $.each(temp, function (i, item) {
      curr_scatter_series_name['data'].push({'x': item.avg_scale, 'y': item.annual_earn,
        'name': item.soc_title, 'jobzone': item.jobzone, 'competency': pelement});
    })
    curr_scatter_series.push(curr_scatter_series_name);
  }
  $('#hcharts1').highcharts({
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
      type: 'scatter'
    },
    xAxis: {
      title: {
        enabled: true,
        text: 'Average score'
      },
      min: 0,
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
      scatter: {
        marker: {
          radius: 3,
          states: {
            hover: {
              enabled: true,
              lineColor: 'rgb(100,100,100)'
            }
          }
        },
        states: {
          hover: {
            marker: {
              enabled: false
            }
          }
        },
        tooltip: {
          headerFormat: '<b>{series.name}</b><br>',
          pointFormat: '{point.name}: <br>Score: {point.x: .1f}, <br>Annual earnings: ${point.y}, <br>Competency: {point.competency}'
        }
      }
    },
    series: curr_scatter_series,
    credits: {
      enabled: false
    }
  });
}

function barChart(pelement) {
  var labels = ["Top quartile", "2nd quartile", "3rd quartile", "Bottom quartile"];
  var colorpalette2 = ["#B2D732", "#66B032", "#347B98", "#092834"];
  curr_xcat = ["Job zone 1", "Job zone 2", "Job zone 3", "Job zone 4", "Job zone 5"];
  curr_bar_series = [];
  curr_data_bar = $.grep(arr_data, function (n, i) {
    return n.element_name === pelement && n.type === "0";
  });
  for (j=0; j<4; j=j+1) {
    temp = $.grep(curr_data_bar, function (n, i) {
      return n.rank_scale === String(j);
    });
    curr_bar_series_name = {'name': labels[j], 'data':[], 'color': colorpalette2[j]};
    $.each(temp, function (i, item) {
      curr_bar_series_name['data'].push({'y': item.annual_earn, 'score': item.avg_scale, 'competency': pelement});
    })
    curr_bar_series.push(curr_bar_series_name);
  }
  $('#hcharts2').highcharts({
    title: {
      style: {
        color: "#696969",
        fontFamily: 'PT Serif Caption'
      },
      text: "Annual earnings by score quartiles and job zone: " + pelement
    },
    chart: {
      type: 'column'
    },
    xAxis: {
      categories: curr_xcat
    },
    yAxis: {
      title: {
        text: null
      },
      gridLineColor: 'transparent',
      labels: {
        /* format: '{value:,.0f}' */
        enabled: true
      }
    },
    tooltip: {
      pointFormatter: function () {
        return this.series.name + ": $" + Highcharts.numberFormat(Math.round(this.y/1000) * 1000, 0) + '<br> Score: ' +
          Highcharts.numberFormat(Math.round(this.score * 10, 0)/10, 1);
      }
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        groupPadding: 0.1,
        dataLabels: {
          enabled: false
        }
      }
    },
    series: curr_bar_series,
    credits: {
      enabled: false
    }
  });
}

function scatterChart2(pelement) {
  curr_scatter2_series = [];
  curr_data_scatter2 = $.grep(arr_data , function (n, i) {
    return n.element_name === pelement && n.type === "2";
  });
  temp = $.grep(curr_data_scatter2, function (n,i) {
    return n.soc_title === 'Farming, fisheries, and forestry' ||
      n.soc_title === 'Construction and extraction' ||
      n.soc_title === 'Installation, maintenance and repair' ||
      n.soc_title === 'Production' ||
      n.soc_title === 'Transportation and material moving';
  });
  curr_scatter2_series_name = {'name': 'Blue-collar', 'color': '#133863', 'data': []};
  $.each(temp, function (i, item) {
    curr_scatter2_series_name['data'].push({'x': item.avg_scale, 'y': item.annual_earn,
      'name': item.soc_title, 'element_name': pelement});
  });
  curr_scatter2_series.push(curr_scatter2_series_name);
  temp = $.grep(curr_data_scatter2, function (n,i) {
    return !(n.soc_title === 'Farming, fisheries, and forestry' ||
      n.soc_title === 'Construction and extraction' ||
      n.soc_title === 'Installation, maintenance and repair' ||
      n.soc_title === 'Production' ||
      n.soc_title === 'Transportation and material moving');
  });
  curr_scatter2_series_name = {'name': 'White-collar', 'color': '#C8C8C8', 'data': []};
  $.each(temp, function (i, item) {
    curr_scatter2_series_name['data'].push({'x': item.avg_scale, 'y': item.annual_earn,
      'name': item.soc_title, 'element_name': pelement});
  })
  curr_scatter2_series.push(curr_scatter2_series_name);
  $('#hcharts3').highcharts({
    title: {
      style: {
        color: "#696969",
        fontFamily: 'PT Serif Caption'
      },
      text: pelement + " score and earnings"
    },
    subtitle: {
      text: "Major occupations"
    },
    chart: {
      type: 'scatter'
    },
    xAxis: {
      title: {
        enabled: true,
        text: 'Average score'
      },
      min: 0,
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
      scatter: {
        marker: {
          radius: 5,
          states: {
            hover: {
              enabled: true,
              lineColor: 'rgb(100,100,100)'
            }
          }
        },
        states: {
          hover: {
            marker: {
              enabled: false
            }
          }
        },
        tooltip: {
          headerFormat: '<b>{series.name}</b><br>',
          pointFormat: '<em>{point.element_name}</em> <br> {point.name}: Score: {point.x: .1f}, <br>Annual earnings: ${point.y}'
        }
      }
    },
    series: curr_scatter2_series,
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
      create_dmenu(arr_data);
      barChart(curr_element);
      scatterChart2(curr_element);
      scatterChart(curr_element);

      $(".d-element").on('click', function () {
        curr_element = $(this).text().trim();
        scatterChart(curr_element);
        barChart(curr_element);
        scatterChart2(curr_element);
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
      // console.log(curr_data_bar);
      // console.log(curr_scatter_series);
      // console.log(arr_data);
    });
  });
});
