var GaussianProcess = function() {
  
  // instantiate modules

  // sample a function from the gp prior
  function prior(x) {
    var l  = math.multiply(kernel(math.matrix(x),math.matrix(x),hyperparameters),np.random_normal(100));
    return l;
  };

  // get the mean function and covariance of the posterior 
  // gp distribution
  function posterior(x,observations,noise) {
    var lol = math.matrix(observations._data);

    var x_obs = math.matrix(math.transpose(lol)._data[0]);
    var y_obs = math.matrix(math.transpose(lol)._data[1]);

    var k_test   = kernel(x,x,hyperparameters);
    var k_test2  = kernel(x,x_obs,hyperparameters);
    var k_obsv   = kernel(x_obs,x_obs,hyperparameters);

    // calculate mean value of posterior distribution
    var Z = math.multiply(math.eye(k_obsv._data.length),noise)
    var A = math.inv(math.add(k_obsv , Z));
    var B = math.multiply(k_test2,A);
    var C = math.multiply(B,y_obs);
    //var C = math.add(C,math.multiply(x,0.1));
    var post_mu = (math.transpose([x,C]))
    // calculate convariance matrix for the posterior
    var D = kernel(x_obs,x,hyperparameters)
    var post_cov = math.subtract(k_test,math.multiply(B,D));

    //return posterior mean and posterior covariance
    return [post_mu, post_cov];
  };

  // make an observation of the latent function
  function observe (number_observations,range, noise) {
    var values = [];

    if (number_observations==0) {
      return math.matrix(values);
    };

    var x = np.random_float(range[0],range[1],number_observations);
    for (var i= 0; i< number_observations; i++) {
      values.push( oracle(x._data[i]) + d3.randomNormal(0,noise)());
    };
    values = math.transpose([x._data,values]);
    return math.matrix(values);
  };

  // oracle is the true latent function
  // used for program-generated observations
  function oracle(x) {
    var y = math.cos(x) + x/5;
    return y; 
  };

  // initialise the program
  function init () {
    // define the domain for the GP
    X_range = np.linspace(0,10,100);

    // make observations from our latent function
    obs_noise = 0.5;
    observations = observe(num_observations,[0,10],obs_noise);

    plot.prior(X_range);
    plot.posterior(X_range,observations,obs_noise);
    plot.plot_observations(observations)
  };

  return {
    init: init,
    prior: prior,
    posterior: posterior
  };

};

