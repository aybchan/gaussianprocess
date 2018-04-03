var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1280 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// set the ranges
var x_scale = d3.scaleLinear().range([0, width]);
var y_scale = d3.scaleLinear().range([height, 0]);

var color = d3.scaleLinear()
    .domain([0, 1])
    .range(["red", "blue"]);

// define the line
var valueline = d3.line()
    .x(function(d) { return x(d); })
    .y(function(d) { return y(d); });

var svg = d3.select("div.container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

    // // Add the valueline path.
    // svg.append("path")
    //     .data([data])
    //     .attr("x", "y")
    //     .attr("d", valueline);


    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(" + margin.left + ',' + height + ")")
        .call(d3.axisBottom(x_scale));

    // Add the Y Axis
    svg.append("g")
        .attr("transform", "translate(" + margin.left + ',' + 0 + ")")
        .call(d3.axisLeft(y_scale));


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
          .attr("stroke", color(Math.random()))
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", .3)
          .attr("d", line)
          .attr("transform", "translate(" + margin.left + ',' + 0 + ")");


          svg.on('click',function () {
            var coords = d3.mouse(this);
            click(dat,coords);})

            function click(dat,coords) {
              console.log(coords);
              dat.push([x_scale.invert(coords[0]-margin.left),
                          y_scale.invert(coords[1])]);

              svg.append('circle')
                  .attr('class', 'click-circle')
                  .attr("cx", coords[0])
                  .attr("cy", coords[1])
                  .attr("r", 5);

              svg.append("path")
                  .datum(dat)
                  .attr("fill", "none")
                  .attr("stroke", "steelblue")
                  .attr("stroke-linejoin", "round")
                  .attr("stroke-linecap", "round")
                  .attr("stroke-width", 1.5)
                  .attr("d", line)
                  .attr("transform", "translate(" + margin.left + ',' + 0 + ")");
            }

    }

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
  var k = np_subtract_vec(x_i,x_j);
  k = np_element_op(k,function (d) { return math.pow(d,2); });
  k = math.abs(k);
  k = math.subtract(0,k);
  k = math.exp(k);

  return k;
}

function gp_prior(x) {
  var l  = math.multiply(k_sqex(math.matrix(x),math.matrix(x)),np_random_normal(100));
  return l
}

function gp_posterior(x,obs) {
  var x_obs = math.matrix(math.transpose(obs)._data[0]);
  var y_obs = math.matrix(math.transpose(obs)._data[1]);
  var noise = 1;

  var k_test   = k_sqex(x,x);
  var k_test2  = k_sqex(x,x_obs);
  var k_obsv   = k_sqex(x_obs,x_obs);

  // calculate mean value of posterior distribution
  var Z = math.multiply(math.eye(k_obsv._data.length),noise)
  var A = math.inv(math.add(k_obsv , Z));
  var B = math.multiply(k_test2,A);
  var C = math.multiply(B,y_obs);

  // calculate convariance matrix for the posterior
  var D = k_sqex(x_obs,x)
  var E = math.subtract(k_test,math.multiply(B,D));

  //return posterior mean and posterior covariance
  return [math.transpose([x,C]), E];
};

// var X_range = Array.from({length: 200}, (x,i) => i);
var X_range = np_linspace(0,10,100)


// sample from the prior distribution
for (var g = 0; g < 20; g++) {
  var data = math.transpose([X_range._data,gp_prior(X_range._data)._data]);
  plot(data);
}

var observe = function (number_observations,range) {
  var values = [];
  var noise = 1;
  var x = np_linspace(range[0], range[1],number_observations);
  var oracle = function (d) { return math.cos(d/3) + d; };
  for (var i_oracle = 0; i_oracle < number_observations; i_oracle++) {
    values.push( oracle(x._data[i_oracle]) + d3.randomNormal(0,noise)());
  };
  values = math.transpose([x._data,values]);
  return math.matrix(values);
};
var plot_line = function (data,linewidth) {
  var line = d3.line()
                .curve(d3.curveBasis)
                .x(function(d) { return x_scale(d[0]); })
                .y(function(d) { return y_scale(d[1]); })

  svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", 'black')
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", linewidth)
      .attr("d", line)
      .attr("transform", "translate(" + margin.left + ',' + 0 + ")")
      .style("stroke-dasharray", ("3,2"));

}
var plot_circle = function (coords) {
  svg.append('circle')
      .attr('class', 'circle')
      .attr("cx", x_scale(coords[0])+margin.left)
      .attr("cy", y_scale(coords[1]))
      .attr("r", 3);
}

var plot_posterior = function (num_samples,x,observations) {
  var post = gp_posterior(x,observations);

  // plot posterior mean
  plot_line(post[0],2);

  //plot posterior deviations
  var x  = math.matrix(math.transpose(post[0])[0])
  var mu = math.matrix(math.transpose(post[0])[1]);
  var std_dev = math.matrix(math.diag(post[1]._data));

  plot_line(math.transpose([x,math.add(mu,math.multiply(std_dev,2))]),1)
  plot_line(math.transpose([x,math.subtract(mu,math.multiply(std_dev,2))]),1)
};

var num_obs   = 200;

var obs = observe(num_obs,[0,5]);

for (var i_obs = 0; i_obs < obs._data.length; i_obs++) {
  plot_circle(obs._data[i_obs])
};

plot_posterior(5,X_range,obs);
