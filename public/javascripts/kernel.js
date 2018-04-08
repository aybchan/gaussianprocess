var Kernel = function () {

  function squared_exponential (x_i,x_j) {
    var sigma = hyperparameters[0];
    var ell   = hyperparameters[1];

    var k = np.subtract(x_i,x_j);
    k = np.element_op(k,function (d) { return math.pow(d,2); });
    k = math.multiply(k,1/ell);
    k = math.exp(math.subtract(0,k));
    k = math.multiply(sigma**2,k);
    return k;

  };

  function periodic(x_i,x_j) {
    var sigma = hyperparameters[0];
    var ell = hyperparameters[1];
    var p = hyperparameters[2];

    var k = math.abs(np.subtract(x_i,x_j));
    k = math.multiply(math.pi,k);
    k = math.multiply(k,1/p);
    k = math.abs(k);
    k = np.element_op(k,function(d) { 
                      return math.sin(d)**2; 
                    });
    k = math.multiply(-2/ell**2, k)

    return k;
  };

  function combine(x_i,x_j) {
    var sigma = hyperparameters[0];
    var ell   = hyperparameters[1];
    var p     = hyperparameters[2];
      
    var sq_ex = squared_exponential(x_i,x_j,sigma,ell);
    var perio = periodic(x_i,x_j,sigma,ell,p);

    return math.multiply(sq_ex,perio);
  }
  
  function not_sure_lol() {
    var c = 1
    var sig_i = 1
    var sig_j = 1

    //var A = math.multiply(math.subtract(math.reshape(x_i,[x_i._data.length,1]),c),math.reshape(math.subtract(math.matrix(x_j),c),[1,x_j._data.length]));
    //var A = math.subtract(math.reshape(x_i,[x_i._data.length,1]),c)
    //var B = math.reshape(math.subtract(x_j,c),[1,x_j._data.length])
    //var m = math.multiply(A,B)
    //m = math.add(sig_j,math.multiply(sig_i,m))

    var k = [];
    return k;
  };

  return {
    squared_exponential: squared_exponential,
    periodic: periodic,
    combine: combine
  };
};
