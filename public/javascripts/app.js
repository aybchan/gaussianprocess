// define variables for GP 
var obs_noise = 5 ; 
var num_observations = 6;
var observations = [];
var X_range = [];
var num_prior_samples     = 200;
var num_posterior_samples = 200;

var x_range = [-5,5];
var dim   = 100;

var GP = new GaussianProcess()
var plot = new Plot();
var K    = new Kernel();
var np   = new NP();

var kernel = K.squared_exponential;
var hyperparameters = [1.3,1];

//var kernel = K.periodic;
//var hyperparameters = [5,1/3,0.05];

GP.init();
