
var statisticsChart = new Chart( document.getElementById('statisticsChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [ {
            label: "Subscribers",
            borderColor: '#f3545d',
            pointBackgroundColor: 'rgba(243, 84, 93, 0.6)',
            pointRadius: 0,
            backgroundColor: 'rgba(243, 84, 93, 0.4)',
            legendColor: '#f3545d',
            fill: true,
            borderWidth: 2,
            data: [154, 184, 175, 203, 210, 231, 240, 278, 252, 312, 320, 374]
        }, {
            label: "New Visitors",
            borderColor: '#fdaf4b',
            pointBackgroundColor: 'rgba(253, 175, 75, 0.6)',
            pointRadius: 0,
            backgroundColor: 'rgba(253, 175, 75, 0.4)',
            legendColor: '#fdaf4b',
            fill: true,
            borderWidth: 2,
            data: [256, 230, 245, 287, 240, 250, 230, 295, 331, 431, 456, 521]
        }, {
            label: "Active Users",
            borderColor: '#177dff',
            pointBackgroundColor: 'rgba(23, 125, 255, 0.6)',
            pointRadius: 0,
            backgroundColor: 'rgba(23, 125, 255, 0.4)',
            legendColor: '#177dff',
            fill: true,
            borderWidth: 2,
            data: [542, 480, 430, 550, 530, 453, 380, 434, 568, 610, 700, 900]
        }]
    },
    options : {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        tooltips: {
            bodySpacing: 4,
            mode:"nearest",
            intersect: 0,
            position:"nearest",
            xPadding:10,
            yPadding:10,
            caretPadding:10
        },
        layout:{
            padding:{left:5,right:5,top:15,bottom:15}
        },
        scales: {
            yAxes: [{
                ticks: {
                    fontStyle: "500",
                    beginAtZero: false,
                    maxTicksLimit: 5,
                    padding: 10
                },
                gridLines: {
                    drawTicks: false,
                    display: false
                }
            }],
            xAxes: [{
                gridLines: {
                    zeroLineColor: "transparent"
                },
                ticks: {
                    padding: 10,
                    fontStyle: "500"
                }
            }]
        },
        legendCallback: function(chart) {
            var text = [];
            text.push('<ul class="' + chart.id + '-legend html-legend">');
            for (var i = 0; i < chart.data.datasets.length; i++) {
                text.push('<li><span style="background-color:' + chart.data.datasets[i].legendColor + '"></span>');
                if (chart.data.datasets[i].label) {
                    text.push(chart.data.datasets[i].label);
                }
                text.push('</li>');
            }
            text.push('</ul>');
            return text.join('');
        }
    }
});

var myLegendContainer = document.getElementById("myChartLegend");

// generate HTML legend
myLegendContainer.innerHTML = statisticsChart.generateLegend();

// bind onClick event to all LI-tags of the legend
var legendItems = myLegendContainer.getElementsByTagName('li');
for (var i = 0; i < legendItems.length; i += 1) {
    legendItems[i].addEventListener("click", legendClickCallback, false);
}


new Chart(document.getElementById('dailyVisitors').getContext('2d'), {
    type: 'line',
    data: {
        labels:["January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September"],
        datasets:[ {
            label: "Sales Analytics", fill: !0, backgroundColor: "rgba(255,255,255,0.2)", borderColor: "#fff", borderCapStyle: "butt", borderDash: [], borderDashOffset: 0, pointBorderColor: "#fff", pointBackgroundColor: "#fff", pointBorderWidth: 1, pointHoverRadius: 5, pointHoverBackgroundColor: "#fff", pointHoverBorderColor: "#fff", pointHoverBorderWidth: 1, pointRadius: 1, pointHitRadius: 5, data: [65, 59, 80, 81, 56, 55, 40, 35, 30]
        }]
    },
    options : {
        maintainAspectRatio:!1, legend: {
            display: !1
        }
        , animation: {
            easing: "easeInOutBack"
        }
        , scales: {
            yAxes:[ {
                display:!1, ticks: {
                    fontColor: "rgba(0,0,0,0.5)", fontStyle: "bold", beginAtZero: !0, maxTicksLimit: 10, padding: 0
                }
                , gridLines: {
                    drawTicks: !1, display: !1
                }
            }
            ], xAxes:[ {
                display:!1, gridLines: {
                    zeroLineColor: "transparent"
                }
                , ticks: {
                    padding: -20, fontColor: "rgba(255,255,255,0.2)", fontStyle: "bold"
                }
            }
            ]
        }
    }
});

$('#lineChart').sparkline([102,109,120,99,110,105,115], {
    type: 'line',
    height: '70',
    width: '100%',
    lineWidth: '2',
    lineColor: '#177dff',
    fillColor: 'rgba(23, 125, 255, 0.14)'
});

$('#lineChart2').sparkline([99,125,122,105,110,124,115], {
    type: 'line',
    height: '70',
    width: '100%',
    lineWidth: '2',
    lineColor: '#f3545d',
    fillColor: 'rgba(243, 84, 93, .14)'
});

$('#lineChart3').sparkline([105,103,123,100,95,105,115], {
    type: 'line',
    height: '70',
    width: '100%',
    lineWidth: '2',
    lineColor: '#ffa534',
    fillColor: 'rgba(255, 165, 52, .14)'
});

$('#map-example').vectorMap(
    {
        map: 'world_en',
        backgroundColor: 'transparent',
        borderColor: '#fff',
        borderWidth: 2,
        color: '#e4e4e4',
        enableZoom: true,
        hoverColor: '#35cd3a',
        hoverOpacity: null,
        normalizeFunction: 'linear',
        scaleColors: ['#b6d6ff', '#005ace'],
        selectedColor: '#35cd3a',
        selectedRegions: ['ID', 'RU', 'US', 'AU'],
        showTooltip: true,
        onRegionClick: function(element, code, region)
        {
            return false;
        },
        onResize: function (element, width, height) {
            console.log('Map Size: ' +  width + 'x' +  height);
        },
    });