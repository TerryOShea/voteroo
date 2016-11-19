const customOptionToggleBtn = document.querySelector('.custom-option-toggle-btn'), 
      customOptionForm = document.querySelector('.custom-option-form'), 
      graphContainer = d3.select('.graph-container');

const colorOffset = Math.ceil(Math.random()*360), 
      colorSpaced = Math.floor(360/seedData.length);

const totalVotes = seedData.reduce((x, y) => x + y.votes, 0);
seedData = seedData.filter(x => x.votes > 0);

var vw = window.innerWidth;

customOptionToggleBtn.addEventListener('click', function() {
  this.style.display = "none";
  customOptionForm.style.display = "block";
});

window.addEventListener('resize', function() {
  let newWidth = window.innerWidth;
  if ((vw >= 1060 && newWidth < 1060) || (vw < 1060 && newWidth >= 1060)) {
    prepNewPoll(newWidth);
  }
  else if ((vw >= 680 && newWidth < 680 ) || (vw < 680 && newWidth >= 680)) {
    prepNewPoll(newWidth);
  }
});

function prepNewPoll(newWidth) {
  vw = newWidth;
  graphContainer.html('<div class="graph-center"></div>');
  drawPoll();
}

drawPoll();

function drawPoll() {
  var radius, innerRadius;
  
  if (vw > 1060) {
    radius = 250;
    innerRadius = 125;
  }
  else if (vw > 680) {
    radius = 200; 
    innerRadius = 100;
  }
  else {
    radius = 150;
    innerRadius = 75;
  }
  
  //the title in the center of the graph
  d3.select('.graph-center')
    .style('width', innerRadius*2 + 'px')
    .style('height', innerRadius*2 + 'px')
    .style('transform', 'translate(' + (radius - innerRadius) + 'px, ' + (radius - innerRadius) + 'px)')
    .html('<h1 class="graph-title">' + seedTitle + '</h1>');

  var graphTitle = d3.select('.graph-title');
  if (totalVotes == 0) graphTitle.html(graphTitle.html() + ' (no votes yet)');
  else {
    var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(innerRadius);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.votes });

    var svg = graphContainer.append('svg')
      .attr('width', radius*2)
      .attr('height', radius*2)
      .append('g')
        .attr('transform', 'translate(' + radius + ',' + radius + ')')

    var mouseover = function(d) {
      graphTitle.html(d.data.option.toUpperCase() + '<br>(' + (d.data.votes*100/totalVotes).toFixed(2) + '%, ' + d.data.votes + '/' + totalVotes + ' votes)')
    }

    var mouseout = function(d) {
      graphTitle.html(seedTitle)
    }

    //the colored arcs
    var g = svg.selectAll('.arc')
      .data(pie(seedData))
      .enter().append('g')
        .attr('class', 'arc')
        .on('mouseover', (d) => mouseover(d))
        .on('mouseout', (d) => mouseout(d))
        .append('path')
          .attr('d', arc)
          /*.attr('fill', (d, i) => color((i*colorSpaced+colorOffset)%360));*/
          /*.attr('fill', (d, i) => (i*colorSpaced+colorOffset)%360);*/
          .attr('fill', (d, i) => "hsl(" + ((i * colorSpaced + colorOffset) % 360) + ", 80%, 70%)");

    //the labels (done separately so that arcs do not overlap them)
    var h = svg.selectAll('.label')
      .data(pie(seedData))
      .enter().append('g')
        .attr('class', 'label')
        .on('mouseover', (d) => mouseover(d))
        .on('mouseout', (d) => mouseout(d))
        .append('text')
          .attr('transform', (d) => 'translate(' + arc.centroid(d) + ')')
          .attr('class', 'label-text')
          .text((d, i) => seedData[i].option);
  }
}