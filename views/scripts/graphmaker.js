var totalVotes = seedData.reduce((x, y) => x + y.votes, 0);

seedData = seedData.filter(x => x.votes > 0);

var radius = 250,
    innerRadius = 125,
    colorOffset = Math.ceil(Math.random()*10);

//the title in the center of the graph
d3.select('.graph-center')
  .style('width', innerRadius*2 + 'px')
  .style('height', innerRadius*2 + 'px')
  .style('transform', 'translate(' + (radius - innerRadius) + 'px, ' + (radius - innerRadius) + 'px)')
  .html('<h1 class="graph-title">' + seedTitle + '</h1>');

var graphTitle = d3.select('.graph-title');
if (totalVotes == 0) graphTitle.html(graphTitle.html() + ' (no votes yet)');
else {

var color = d3.scale.ordinal()
  .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  .range(['#FF7F50', '#BDEC90', '#FBB148', '#95E5C2', '#C9A1B9', '#F3E5AB', '#886280', '#EE6363', '#ADD8E6', '#6D8BED']);

var arc = d3.svg.arc()
  .outerRadius(radius)
  .innerRadius(innerRadius);

var pie = d3.layout.pie()
  .sort(null)
  .value(function(d) { return d.votes });

var svg = d3.select('.graph-container').append('svg')
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
      .attr('fill', (d, i) => color((i+colorOffset)%10));

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