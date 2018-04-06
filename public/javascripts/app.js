// define variables for GP 
var obs_noise = 5 ; 
var num_observations = 10;
var observations = [];
var X_range = [];
var num_prior_samples     = 100;
var num_posterior_samples = 150;


var GP = new GaussianProcess()
var plot = new Plot();
var K    = new Kernel();
var np   = new NP();

GP.init();
