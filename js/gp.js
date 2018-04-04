var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1280 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// set the ranges
var x_scale = d3.scaleLinear().range([0, width]);
var y_scale = d3.scaleLinear().range([height, 0]);

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
        .attr("transform", "translate(" + margin.left + ',' + height + ")")
        .call(d3.axisBottom(x_scale));

    // Add the Y Axis
    svg.append("g")
        .attr("transform", "translate(" + margin.left + ',' + 0 + ")")
        .call(d3.axisLeft(y_scale));

var plot_circle = function (coords,color) {
  svg.append('circle')
      .attr('class', 'circle')
      .attr("cx", x_scale(coords[0])+margin.left)
      .attr("cy", y_scale(coords[1]))
      .attr("r", 5)
      .attr("fill",color);
};


function plot(dat) {
  // Scale the range of the data
  x_scale.domain(d3.extent(dat, function(d) { return d[0]; }));
  y_scale.domain(d3.extent(dat, function(d) { return d[1]; }));
  x_scale.domain([0,10]);
  y_scale.domain([-10,10]);

  var line = d3.line()
                .curve(d3.curveBasis)
                .x(function(d) { return x_scale(d[0]); })
                .y(function(d) { return y_scale(d[1]); })

  svg.append("path")
      .datum(dat)
      .attr("fill", "none")
      .attr("stroke", prior_color(Math.random()))
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", .5)
      .attr("d", line)
      .attr("transform", "translate(" + margin.left + ',' + 0 + ")");


  svg.on('click',function () {
    var coords = d3.mouse(this);
    click(dat,coords);})

  function click(dat,coords) {
    //console.log(coords);
    obs._data.push([x_scale.invert(coords[0]- margin.left),
                y_scale.invert(coords[1])]);
    plot_circle([x_scale.invert(coords[0]-margin.left),y_scale.invert(coords[1])],'red');

    remove_paths();
    replot_paths(obs);
    };
};

function fn(x) {
  return Math.sin(x/10) + d3.randomNormal(x/150,0.2)()
}

function np_linspace(startValue, stopValue, cardinality) {
  var arr = [];
  var currValue = startValue;
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(currValue + (step * i));
  }
  return math.matrix(arr);
}

function np_ones(size,p) {
  var ones = [];
  for (var i_ones = 0; i_ones < size; i_ones++) {
    ones.push(1);
  }
  return math.multiply(math.matrix(ones),p);
}

function np_subtract_vec(a,b) {
  var a_len = a._data.length;
  var b_len = b._data.length;
  var rows = new Array(a_len);

  for (var i = 0; i < a_len; i++) {
    rows[i] = new Array(b_len);
    for (var j = 0; j < b_len; j++) {
      rows[i][j] = a._data[i] - b._data[j];
    };
  };

  return rows;
};

function np_random_normal(size) {
  var a = [];

  for ( var i = 0; i < size; i++){
      a.push(d3.randomNormal(0,1)());
  }
  return math.matrix(a);
}

function np_element_op(mat,op) {
  var new_mat = [];
  mat.forEach(function (row, index, mat) {
    var new_row = [];
    row.forEach(function (elem, id, mat) {
      new_row.push(elem**2);
    });
    new_mat.push(new_row);
  });
  return math.matrix(new_mat);
}

function k_sqex (x_i,x_j) {
  var sigma = 1; // who knows
  var p = 1;  // lower =  bias towards prior
  var ell = 1; // length scale

  var k = math.abs(np_subtract_vec(x_i,x_j));
  k = math.multiply(math.pi,k);
  k = math.multiply(k,1/p);
  k = math.abs(k);
  k = np_element_op(k,function(d) { return math.sin(d)**2; });
  k = math.multiply(-2/ell**2, k)

  // return here for periodic kernel
  // return k

  var l = np_subtract_vec(x_i,x_j);
  l = np_element_op(l,function (d) { return math.pow(d,2); });
  k = math.exp(math.subtract(k,l));
  // return k;

  var c = 1
  var sig_i = 1
  var sig_j = 1

  //var A = math.multiply(math.subtract(math.reshape(x_i,[x_i._data.length,1]),c),math.reshape(math.subtract(math.matrix(x_j),c),[1,x_j._data.length]));
  //var A = math.subtract(math.reshape(x_i,[x_i._data.length,1]),c)
  //var B = math.reshape(math.subtract(x_j,c),[1,x_j._data.length])
  //var m = math.multiply(A,B)
  //m = math.add(sig_j,math.multiply(sig_i,m))

  return k

}

function k_lol (x_i,x_j) {
  k = math.abs(k);
  k = math.subtract(0,k);
  k = math.exp(k);

  return k;
}

function gp_prior(x) {
  var l  = math.multiply(k_sqex(math.matrix(x),math.matrix(x)),np_random_normal(100));
  return l
}

function gp_posterior(x,obs,noise) {
  var lol = math.matrix(obs._data);

  var x_obs = math.matrix(math.transpose(lol)._data[0]);
  var y_obs = math.matrix(math.transpose(lol)._data[1]);

  var k_test   = k_sqex(x,x);
  var k_test2  = k_sqex(x,x_obs);
  var k_obsv   = k_sqex(x_obs,x_obs);

  // calculate mean value of posterior distribution
  var Z = math.multiply(math.eye(k_obsv._data.length),noise)
  var A = math.inv(math.add(k_obsv , Z));
  var B = math.multiply(k_test2,A);
  var C = math.multiply(B,y_obs);
  //var C = math.add(C,math.multiply(x,0.1));
  var post_mu = (math.transpose([x,C]))
  // calculate convariance matrix for the posterior
  var D = k_sqex(x_obs,x)
  var post_cov = math.subtract(k_test,math.multiply(B,D));

  //return posterior mean and posterior covariance
  return [post_mu, post_cov];
};

var observe = function (number_observations,range, noise) {
  var values = [];

  var x = np_linspace(range[0], range[1],number_observations);
  var oracle = function (d) { return math.cos(d/3) + d/10; };
  for (var i_oracle = 0; i_oracle < number_observations; i_oracle++) {
    values.push( oracle(x._data[i_oracle]) + d3.randomNormal(0,noise)());
  };
  values = math.transpose([x._data,values]);
  return math.matrix(values);
};

var plot_line = function (data,linewidth,color) {
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

}

var plot_posterior = function (x,num_samples,observations,noise) {
  var post = gp_posterior(x,observations,noise);

  // organise the parameters of the posterior
  var x  = math.matrix(math.transpose(post[0])[0])
  var mu = math.matrix(math.transpose(post[0])[1]);
  var cov = post[1];
  var std_dev = math.matrix(math.diag(cov._data));

  // sample from posterior, plot
  for( var i = 0; i < num_samples; i++) {
    var post_sample = math.add(mu,math.multiply(cov,np_random_normal(cov._size[0])));
    plot_line(math.transpose([x,post_sample]),0.8,post_color(Math.random()));
  };

  // (plot these after the samples so they are on top)
  // plot posterior mean
  plot_line(post[0],3,'#0c0c0c');

  //  plot posterior deviations
  plot_line(math.transpose([x,math.add(mu,math.multiply(std_dev,2))]),1,'#202020')
  plot_line(math.transpose([x,math.subtract(mu,math.multiply(std_dev,2))]),1,'#202020')


};

var plot_prior = function (x,num_prior_samples) {
  // sample from the prior distribution
  for (var g = 0; g < num_prior_samples; g++) {
    var data = math.transpose([x._data,gp_prior(x._data)._data]);
    plot(data);
  };
};

var plot_observations = function (observations) {
  var i_obs = 0;
  for (i_obs; i_obs < num_observations; i_obs++) {
    plot_circle(obs._data[i_obs],"#0165cb");
  };

  for (i_obs; i_obs < num_observations; i_obs++) {
    plot_circle(obs._data[i_obs],"red");
  };
};

var remove_paths = function () {
  var num_lines_to_remove = svg.selectAll('path')._groups[0].length - 2;
  for (var i = 0; i < num_lines_to_remove; i++) {
    svg.selectAll('path')._groups[0][2].remove();
  };
};

var replot_paths = function (data) {
  var num_prior_samples     = 75;
  var num_posterior_samples = 75;
  plot_prior(X_range,num_prior_samples);
  plot_posterior(X_range,num_posterior_samples,data,obs_noise);
  plot_observations(data)
};


// 'main'
// define the domain for the GP
var X_range = np_linspace(0,10,100);

// make observations from our latent function
var obs_noise = 2;
var num_observations = 50;
var obs = observe(num_observations,[0,10],obs_noise);

var num_prior_samples     = 75;
var num_posterior_samples = 75;
plot_prior(X_range,num_prior_samples);
plot_posterior(X_range,num_posterior_samples,obs,obs_noise);
plot_observations(obs)
