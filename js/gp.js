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
          .attr("stroke-width", 1.5)
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

function K_squexp(x_i,x_j) {
  var k = new Array(x_i.length);
  x_i.map(function (d,i) {
    k[i] = new Array(x_i.length)
    x_i.map(function (d,j) {
      var value = Math.exp(
                    - Math.abs(
                        Math.pow(x_i[i] - x_j[j],2)
                    )
                  )
      k[i][j] = value;
    })
  })
  return k
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
  // a and b are vectors of same length
  var l = a._data.length;
  var A = new Array(l)
  var mat = new Array(l);

  for (var i_sub = 0; i_sub < l; i_sub++) {
    mat[i_sub] = math.subtract(np_ones(l,b._data[i_sub]),a)._data;
  }
  return mat
}

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

  //   math.subtract(0,
  //     math.pow(,2)));
  return k;
}

function gp_prior(x) {
  var p = np_random_normal(x.length);
  var l  = math.multiply(k_sqex(math.matrix(x),math.matrix(x)),np_random_normal(100));
  return l
}
// var X_range = Array.from({length: 200}, (x,i) => i);
var X_range = np_linspace(0,10,100)
// var Y_range = new Array(X_range.length);
//
// for (var i=0; i < X_range.length; i++) {
//   Y_range[i] = fn(X_range[i]);
// }
for (var g = 0; g < 20; g++) {
  var data = math.transpose([X_range._data,gp_prior(X_range._data)._data]);
  plot(data);
}

var observe = function (number_observations,range) {
  var values = [];
  var noise = 5;
  var x = np_linspace(range[0], range[1],number_observations);
  var oracle = function (d) { return math.cos(d/3) + d/3; };
  for (var i_oracle = 0; i_oracle < number_observations; i_oracle++) {
    values.push( oracle(x._data[i_oracle]) + d3.randomNormal(0,noise)());
  };
  values = math.transpose([x._data,values]);
  return values;
};

var plot_circle = function (coords) {
  svg.append('circle')
      .attr('class', 'circle')
      .attr("cx", x_scale(coords[0])+margin.left)
      .attr("cy", y_scale(coords[1]))
      .attr("r", 5);
}


var num_obs   = 20;

var obs = observe(num_obs,[0,5]);

for (var i_obs = 0; i_obs < obs.length; i_obs++) {
  plot_circle(obs[i_obs])
  console.log(obs[i_obs])
};
