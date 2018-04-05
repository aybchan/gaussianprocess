var plot = new Plot();
var K    = new Kernel();

var obs_noise = 0 ; 
var num_observations = 0;
var obs = [];
var X_range = [];

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


function gp_prior(kernel,x) {
  var l  = math.multiply(kernel(math.matrix(x),math.matrix(x)),np_random_normal(100));
  return l
}

function gp_posterior(kernel,x,obs,noise) {
  var lol = math.matrix(obs._data);

  var x_obs = math.matrix(math.transpose(lol)._data[0]);
  var y_obs = math.matrix(math.transpose(lol)._data[1]);

  var k_test   = kernel(x,x);
  var k_test2  = kernel(x,x_obs);
  var k_obsv   = kernel(x_obs,x_obs);

  // calculate mean value of posterior distribution
  var Z = math.multiply(math.eye(k_obsv._data.length),noise)
  var A = math.inv(math.add(k_obsv , Z));
  var B = math.multiply(k_test2,A);
  var C = math.multiply(B,y_obs);
  //var C = math.add(C,math.multiply(x,0.1));
  var post_mu = (math.transpose([x,C]))
  // calculate convariance matrix for the posterior
  var D = kernel(x_obs,x)
  var post_cov = math.subtract(k_test,math.multiply(B,D));

  //return posterior mean and posterior covariance
  return [post_mu, post_cov];
};

var observe = function (number_observations,range, noise) {
  var values = [];

  if (number_observations==0) {
    return math.matrix(values);
  };

  var x = np_linspace(range[0], range[1],number_observations);
  var oracle = function (d) { return math.cos(d/3) + d/10; };
  for (var i_oracle = 0; i_oracle < number_observations; i_oracle++) {
    values.push( oracle(x._data[i_oracle]) + d3.randomNormal(0,noise)());
  };
  values = math.transpose([x._data,values]);
  return math.matrix(values);
};



// 'main'
var main = function () {
  // define the domain for the GP
  X_range = np_linspace(0,10,100);

  // make observations from our latent function
  obs_noise = 0.5;
  num_observations = 2;
  obs = observe(num_observations,[0,10],obs_noise);

  var num_prior_samples     = 75;
  var num_posterior_samples = 75;
  plot.prior(X_range,num_prior_samples);
  plot.posterior(X_range,num_posterior_samples,obs,obs_noise);
  plot.observations(obs)
};

main();
