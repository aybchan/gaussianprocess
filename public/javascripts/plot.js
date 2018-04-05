var Plot = function() {

  var margin = {top: 50, right: 75, bottom: 50, left: 75},
      width = window.innerWidth - margin.left - margin.right,
      height = window.innerHeight - margin.top - margin.bottom;
  
	var x_range = [0,10];
	var y_range = [-5,5];
  // set the ranges
  var x_scale = d3.scaleLinear().domain([x_range[0],x_range[1]]).range([0, width]);
  var y_scale = d3.scaleLinear().domain([y_range[0],y_range[1]]).range([height, 0]);

  var prior_color = d3.scaleLinear()
      .domain([0, 1])
      .range(["#58c696", "#58bfc6"]);

  var post_color = d3.scaleLinear()
      .domain([0, 1])
      .range(["#c65f58", "#c65f58"]);

  // define the line
  var valueline = d3.line()
      .x(function(d) { return x(d); })
      .y(function(d) { return y(d); });

  var svg = d3.select("div.container").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

      // Add the X Axis
      svg.append("g")
          .attr("transform", "translate(" + margin.left + ',' + height +  ")")
          .call(d3.axisBottom(x_scale));

      // Add the Y Axis
      svg.append("g")
          .attr("transform", "translate(" + margin.left + ',' + 0 + ")")
          .call(d3.axisLeft(y_scale));

  function init (data) {
    // Scale the range of the data
    x_scale.domain(d3.extent(data, function(d) { return d[0]; }));
    y_scale.domain(d3.extent(data, function(d) { return d[1]; }));
    x_scale.domain([0,10]);
    y_scale.domain([-10,10]);

    var line = d3.line()
                  .curve(d3.curveBasis)
                  .x(function(d) { return x_scale(d[0]); })
                  .y(function(d) { return y_scale(d[1]); })

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", prior_color(Math.random()))
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", .5)
        .attr("d", line)
        .attr("transform", "translate(" + margin.left + ',' + 0 + ")");


    svg.on('click',function () {
      var coords = d3.mouse(this);
      click(data,coords);})

    function click(data,coords) {
      //console.log(coords);
      obs._data.push([x_scale.invert(coords[0]- margin.left),
                  y_scale.invert(coords[1])]);
      circle([x_scale.invert(coords[0]-margin.left),y_scale.invert(coords[1])],'red');

      path_remove();
      path_replot(obs);
    };
  };

  function line (data,linewidth,color) {
    var line = d3.line()
                  .curve(d3.curveBasis)
                  .x(function(d) { return x_scale(d[0]); })
                  .y(function(d) { return y_scale(d[1]); })

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", linewidth)
        .attr("d", line)
        .attr("transform", "translate(" + margin.left + ',' + 0 + ")");
        //.style("stroke-dasharray", ("3,2"));

  };

  function circle (coords, color) {
    svg.append('circle')
        .attr('class', 'circle')
        .attr("cx", x_scale(coords[0])+margin.left)
        .attr("cy", y_scale(coords[1]))
        .attr("r", 5)
        .attr("fill",color);
  };

  function posterior (x,num_samples,observations,noise) {
    var post = gp_posterior(K.squared_exponential,x,observations,noise);

    // organise the parameters of the posterior
    var x  = math.matrix(math.transpose(post[0])[0])
    var mu = math.matrix(math.transpose(post[0])[1]);
    var cov = post[1];
    var std_dev = math.matrix(math.diag(cov._data));

    // sample from posterior, plot
    for( var i = 0; i < num_samples; i++) {
      var post_sample = math.add(mu,math.multiply(cov,np_random_normal(cov._size[0])));
      line(math.transpose([x,post_sample]),0.8,post_color(Math.random()));
    };

    // (plot these after the samples so they are on top)
    // plot posterior mean
    line(post[0],3,'#0c0c0c');

    //  plot posterior deviations
    line(math.transpose([x,math.add(mu,math.multiply(std_dev,2))]),1,'#202020')
    line(math.transpose([x,math.subtract(mu,math.multiply(std_dev,2))]),1,'#202020')
  };

  function prior (x,num_prior_samples) {
    // sample from the prior distribution
    var data = [];
    init(data);
    for (var g = 0; g < num_prior_samples; g++) {
      data = math.transpose([x._data,gp_prior(K.squared_exponential,x._data)._data]);
      line(data,1, prior_color(Math.random()));
    };
  };

  function observations (observations) {
    var i_obs = 0;
    for (i_obs; i_obs < num_observations; i_obs++) {
      circle(obs._data[i_obs],"#0165cb");
    };

    for (i_obs; i_obs < num_observations; i_obs++) {
      circle(obs._data[i_obs],"red");
    };
  };

  function path_remove () {
    var num_lines_to_remove = svg.selectAll('path')._groups[0].length - 2;
    for (var i = 0; i < num_lines_to_remove; i++) {
      svg.selectAll('path')._groups[0][2].remove();
    };
  };

  function path_replot (data) {
    var num_prior_samples     = 75;
    var num_posterior_samples = 75;
    prior(X_range,num_prior_samples);
    posterior(X_range,num_posterior_samples,data,obs_noise);
    observations(data)
  };

  return {
    line: line,
    circle: circle,
    prior: prior,
    posterior: posterior,
    observations: observations,
    path_remove: path_remove,
    path_replot: path_replot
  };
};
