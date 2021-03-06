function name2query(name, base) {
  return '<a href=' + base + name + '>' + name + '</a>';
}

function query_via_google(name) {
  return name2query(name, "https://www.google.com.au/search?q=");
}

function query_via_ncbi(name) {
  if(/^rs/.test(name)) {
    return name2query(name, "http://www.ncbi.nlm.nih.gov/snp/?term=");
  } else {
    return name2query(name, "http://www.ncbi.nlm.nih.gov/gene/?term=");
  }
}

function query_via_ensembl(name) {
  if(/^rs/.test(name)) {
    return '<a href=' + 'http://www.ensembl.org/Homo_sapiens/Variation/Summary?v=' + name + ';vdb=variation' + '>' + name + '</a>';
  } else {
    return '<a href=' + 'http://www.ensembl.org/Human/Search/Results?q=' + name + ';facet_feature_type=Gene;site=ensembl;facet_species=Human' + '>' + name + '</a>';
  }
}

function query_via_ucsc(name) {
  return name2query(name, "http://genome.ucsc.edu/cgi-bin/hgTracks?hgHubConnect.destUrl=hgTracks&clade=mammal&org=Human&db=hg19&position=");
}

function replicated(group_id) {
  if(group_id != 3)
    return 'Replicated';
  else 
    return 'NOT replicated';
}

var width = 1500,
    height = 1500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-50)
    .linkDistance(30)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("epistasis.json", function(error, graph) {
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);

  $('svg circle').tipsy({ 
    // fade: true,
    gravity: 'w', 
    html: true,
    delayOut: 2000,
    title: function() {
      var d = this.__data__, name = d.name;
      var url_google = query_via_google(name);
      var url_ncbi = query_via_ncbi(name);
      var url_ensembl = query_via_ensembl(name);
      var url_ucsc = query_via_ucsc(name);
      var url_haploreg2 = '<a href=http://www.broadinstitute.org/mammals/haploreg/haploreg.php>GO TO Haploreg2</a>';
      var rep_status = replicated(d.group);

      return name + ": " + rep_status + "<br />" 
      + 'Google: ' + url_google + "<br />" 
      + "NCBI: " + url_ncbi + "<br />"
      + "Ensembl: " + url_ensembl + "<br />"
      + "UCSC: " + url_ucsc + "<br />"
      + url_haploreg2 + "<br />";
    }
  });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
});

$(function() {
      $('#show-legend').tipsy({ 
      // fade: true,
      gravity: 'ne', 
      html: true,
      delayOut: 2000,
      title: function() {
          return '<ul> \
              <li style="color: #ff7f0e"> Replicated Gene </li> \
              <li style="color: #1f77b4">Replicated SNP</li> \
              <li style="color: #aec7e8">NOT replicated Gene or SNP</li> \
              </ul> \
              Hover over nodes for more annotation'
      }
    })    
  });
